const mongoose = require('mongoose');

const tokenTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['earn', 'spend'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    enum: [
      // Earning
      'milestone_completed',
      'mentorship_session',
      'hackathon_prize',
      'upvote_received',
      'referral_bonus',
      'reputation_milestone',
      'onboarding_bonus',
      // Spending
      'promote_project',
      'premium_mentor',
      'exclusive_team',
      'profile_boost',
      'advanced_analytics',
      'custom_badge',
      'priority_support',
    ],
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  balanceBefore: Number,
  balanceAfter: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
tokenTransactionSchema.index({ userId: 1, createdAt: -1 });
tokenTransactionSchema.index({ type: 1 });

module.exports = mongoose.model('TokenTransaction', tokenTransactionSchema);
