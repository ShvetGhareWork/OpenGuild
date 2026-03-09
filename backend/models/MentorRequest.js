const mongoose = require('mongoose');

const mentorRequestSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'cancelled'],
    default: 'pending',
    index: true
  },
  message: {
    type: String,
    maxlength: 1000
  },
  projectDescription: String,
  expectedDuration: {
    value: Number,
    unit: {
      type: String,
      enum: ['weeks', 'months']
    }
  },
  mentorshipAreas: [String], // e.g., ['technical', 'product', 'design']
  requestedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  respondedAt: Date,
  declineReason: String,
  // Mentor feedback after accepting
  feedback: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    milestone: String
  }]
});

// Compound indexes
mentorRequestSchema.index({ projectId: 1, mentorId: 1 });
mentorRequestSchema.index({ mentorId: 1, status: 1 });
mentorRequestSchema.index({ requestedBy: 1, status: 1 });

// Prevent duplicate mentor requests
mentorRequestSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existing = await this.constructor.findOne({
      projectId: this.projectId,
      mentorId: this.mentorId,
      status: { $in: ['pending', 'accepted'] }
    });
    
    if (existing) {
      const err = new Error('A mentor request for this project already exists');
      err.code = 'DUPLICATE_MENTOR_REQUEST';
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('MentorRequest', mentorRequestSchema);
