const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded avatars)
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/openguild';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/projects', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/reputation', require('./routes/reputation'));
app.use('/api/tokens', require('./routes/tokens'));
app.use('/api/hackathons', require('./routes/hackathons'));
app.use('/api/matching', require('./routes/matching'));
app.use('/api/governance', require('./routes/governance'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join project room for chat
  socket.on('join-project', ({ projectId }) => {
    socket.join(`project-${projectId}`);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  // Send message to project chat
  socket.on('send-message', async ({ projectId, senderId, senderName, content }) => {
    try {
      const Message = require('./models/Message');
      const message = await Message.create({
        projectId,
        senderId,
        senderName,
        content,
      });

      io.to(`project-${projectId}`).emit('new-message', {
        _id: message._id,
        senderId: message.senderId,
        senderName: message.senderName,
        content: message.content,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error('Message send error:', err);
    }
  });

  // Legacy team support
  socket.on('join_team', ({ teamId }) => {
    socket.join(`team_${teamId}`);
    console.log(`User ${socket.id} joined team ${teamId}`);
  });

  socket.on('update_task', ({ teamId, taskId, status, updatedBy }) => {
    io.to(`team_${teamId}`).emit('task_updated', {
      taskId,
      status,
      updatedBy,
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Something went wrong',
    },
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, io };
