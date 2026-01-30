const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  type: {
    type: String,
    enum: [
      'milestone_completed',
      'code_contribution',
      'mentorship_session',
      'project_created',
      'team_joined',
      'hackathon_participation',
      'hackathon_win',
      'upvote_received',
      'skill_verified',
    ],
    required: true,
  },
  description: String,
  impactScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  reputationEarned: {
    type: Number,
    default: 0,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  verifiedBy: {
    type: String,
    enum: ['ai', 'community', 'manual'],
    default: 'manual',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
contributionSchema.index({ userId: 1, createdAt: -1 });
contributionSchema.index({ projectId: 1 });
contributionSchema.index({ type: 1 });

module.exports = mongoose.model('Contribution', contributionSchema);
