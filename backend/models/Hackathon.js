const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  theme: String,
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  prizes: [
    {
      rank: Number,
      title: String,
      amount: Number,
      tokens: Number,
    },
  ],
  rules: String,
  judging: {
    criteria: [String],
    deadline: Date,
  },
  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      teamName: String,
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  submissions: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
      title: String,
      description: String,
      demoUrl: String,
      repoUrl: String,
      submittedAt: {
        type: Date,
        default: Date.now,
      },
      score: {
        type: Number,
        default: 0,
      },
      rank: Number,
    },
  ],
  status: {
    type: String,
    enum: ['upcoming', 'active', 'judging', 'completed'],
    default: 'upcoming',
  },
  maxParticipants: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
hackathonSchema.index({ slug: 1 });
hackathonSchema.index({ status: 1 });
hackathonSchema.index({ startDate: 1 });

// Generate slug
hackathonSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Hackathon', hackathonSchema);
