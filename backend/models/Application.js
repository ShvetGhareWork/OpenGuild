const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  builderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
    index: true
  },
  proposal: {
    type: String,
    required: true,
    maxlength: 2000
  },
  estimatedTime: {
    value: Number,
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months']
    }
  },
  coverLetter: String,
  portfolioLinks: [String],
  appliedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  respondedAt: Date,
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String
});

// Compound indexes for efficient queries
applicationSchema.index({ projectId: 1, builderId: 1 }, { unique: true });
applicationSchema.index({ projectId: 1, status: 1 });
applicationSchema.index({ builderId: 1, status: 1 });

// Prevent duplicate applications
applicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existing = await this.constructor.findOne({
      projectId: this.projectId,
      builderId: this.builderId,
      status: { $in: ['pending', 'accepted'] }
    });
    
    if (existing) {
      const err = new Error('You have already applied to this project');
      err.code = 'DUPLICATE_APPLICATION';
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
