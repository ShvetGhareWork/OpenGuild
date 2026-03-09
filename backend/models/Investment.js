const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  investorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'withdrawn', 'failed'],
    default: 'pending',
    index: true
  },
  // Bidding phase (future module)
  bidAmount: {
    type: Number,
    min: 0
  },
  bidPlacedAt: Date,
  bidStatus: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'outbid']
  },
  // Investment details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  terms: {
    equity: Number, // Percentage
    returnExpected: Number, // Percentage
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['months', 'years']
      }
    },
    milestonePayments: [{
      milestone: String,
      amount: Number,
      paid: {
        type: Boolean,
        default: false
      },
      paidAt: Date
    }]
  },
  investedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  // ROI tracking
  roi: {
    currentValue: Number,
    returnPercentage: Number,
    lastUpdated: Date
  },
  notes: String,
  // Contract/legal
  contractUrl: String,
  signedAt: Date
});

// Compound indexes
investmentSchema.index({ projectId: 1, investorId: 1 });
investmentSchema.index({ investorId: 1, status: 1 });
investmentSchema.index({ projectId: 1, status: 1 });
investmentSchema.index({ investedAt: -1 });

// Calculate ROI
investmentSchema.methods.calculateROI = function() {
  if (!this.roi || !this.roi.currentValue || !this.amount) {
    return 0;
  }
  return ((this.roi.currentValue - this.amount) / this.amount) * 100;
};

// Update ROI
investmentSchema.methods.updateROI = function(currentValue) {
  this.roi = {
    currentValue,
    returnPercentage: this.calculateROI(),
    lastUpdated: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('Investment', investmentSchema);
