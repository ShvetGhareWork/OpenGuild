// Load environment variables
require('dotenv').config();

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

// Register io singleton so routes can emit events
const socketLib = require('./lib/io');
socketLib.setIo(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth
const session = require('express-session');
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
const passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// Serve static files (uploaded avatars)
app.use('/uploads/avatars', express.static('uploads/avatars'));
app.use('/uploads/resumes', express.static('uploads/resumes'));
app.use('/uploads/certificates', express.static('uploads/certificates'));
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
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/reputation', require('./routes/reputation'));
app.use('/api/tokens', require('./routes/tokens'));
app.use('/api/hackathons', require('./routes/hackathons'));
app.use('/api/matching', require('./routes/matching'));
app.use('/api/governance', require('./routes/governance'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/roles', require('./routes/roles'));

// Role-specific routes
app.use('/api/recruiter', require('./routes/roles/recruiter'));
app.use('/api/builder', require('./routes/roles/builder'));
app.use('/api/mentor', require('./routes/roles/mentor'));
app.use('/api/investor', require('./routes/roles/investor'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user's personal notification room
  socket.on('join-user', ({ userId }) => {
    socket.join(`user:${userId}`);
  });

  // Join project room for chat (with membership verification)
  socket.on('join-project', async ({ projectId, userId }) => {
    try {
      const Project = require('./models/Project');
      const project = await Project.findById(projectId);
      if (!project) return;

      const isMember = project.team.some(m => m.userId.toString() === userId) || 
                       project.creatorId.toString() === userId;
      
      if (isMember) {
        socket.join(`project-${projectId}`);
        console.log(`User ${userId} joined project ${projectId}`);
      }
    } catch (err) {
      console.error('Join project error:', err);
    }
  });

  // Typing indicators
  socket.on('typing', ({ projectId, userId, username }) => {
    socket.to(`project-${projectId}`).emit('user-typing', { userId, username });
  });

  socket.on('stop-typing', ({ projectId, userId }) => {
    socket.to(`project-${projectId}`).emit('user-stop-typing', { userId });
  });

  // WebRTC Signaling
  socket.on('call-user', ({ projectId, offer, from, name }) => {
    socket.to(`project-${projectId}`).emit('incoming-call', { offer, from, name });
  });

  socket.on('answer-call', ({ projectId, answer, to }) => {
    socket.to(`project-${projectId}`).emit('call-answered', { answer, to });
  });

  socket.on('ice-candidate', ({ projectId, candidate, to }) => {
    socket.to(`project-${projectId}`).emit('ice-candidate', { candidate, to });
  });

  socket.on('end-call', ({ projectId }) => {
    socket.to(`project-${projectId}`).emit('call-ended');
  });

  // Send message to project chat
  socket.on('send-message', async ({ projectId, senderId, senderName, content, type = 'text', metadata = {} }) => {
    try {
      const Message = require('./models/Message');
      const Conversation = require('./models/Conversation');
      
      const message = await Message.create({
        projectId,
        senderId,
        type,
        metadata,
        content,
      });

      // Update conversation last message
      await Conversation.findOneAndUpdate(
        { projectId },
        { lastMessage: message._id, updatedAt: Date.now() },
        { upsert: true }
      );

      io.to(`project-${projectId}`).emit('new-message', {
        _id: message._id,
        senderId: message.senderId,
        senderName,
        content: message.content,
        type: message.type,
        metadata: message.metadata,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error('Message send error:', err);
    }
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
