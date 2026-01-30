const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  members: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: String,
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  tasks: [
    {
      title: String,
      description: String,
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'done'],
        default: 'todo',
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  messages: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  activities: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      type: String,
      description: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
teamSchema.index({ projectId: 1 });
teamSchema.index({ 'members.userId': 1 });

module.exports = mongoose.model('Team', teamSchema);
