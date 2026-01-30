const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  vision: String,
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  techStack: [String],
  team: [
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
  openRoles: [
    {
      role: String,
      skills: [String],
      description: String,
      filled: {
        type: Boolean,
        default: false,
      },
    },
  ],
  milestones: [
    {
      title: String,
      description: String,
      deadline: Date,
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  upvotedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  views: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['recruiting', 'active', 'completed', 'archived'],
    default: 'recruiting',
  },
  applications: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      roleId: String,
      roleName: String,
      message: String,
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
      reviewedAt: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
projectSchema.index({ slug: 1 });
projectSchema.index({ creatorId: 1 });
projectSchema.index({ upvotes: -1 });
projectSchema.index({ techStack: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ createdAt: -1 });

// Generate slug from name
projectSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
