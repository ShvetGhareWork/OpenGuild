const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: String,
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  avatar: String,
  bio: String,
  
  // RBAC: Multi-role support with active role switching
  roles: {
    type: [String],
    enum: ['builder', 'mentor', 'investor', 'recruiter'],
    default: ['builder'], // Default role for new users
    validate: {
      validator: function(roles) {
        return roles && roles.length > 0;
      },
      message: 'User must have at least one role'
    }
  },
  activeRole: {
    type: String,
    enum: ['builder', 'mentor', 'investor', 'recruiter'],
    default: 'builder',
    validate: {
      validator: function(activeRole) {
        return this.roles && this.roles.includes(activeRole);
      },
      message: 'Active role must be one of the user\'s assigned roles'
    }
  },
  roleConfirmed: {
    type: Boolean,
    default: false, // Existing users need to confirm role on first login
  },
  roleConfirmedAt: Date,
  
  // Role-specific data
  roleData: {
    recruiter: {
      company: String,
      projectsCreated: { type: Number, default: 0 },
      buildersHired: { type: Number, default: 0 }
    },
    builder: {
      projectsCompleted: { type: Number, default: 0 },
      specializations: [String],
      availability: {
        type: String,
        enum: ['full-time', 'part-time', 'weekends', 'unavailable'],
        default: 'part-time'
      }
    },
    mentor: {
      expertise: [String],
      projectsMentored: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 }
    },
    investor: {
      investmentCapacity: Number,
      investmentsMade: { type: Number, default: 0 },
      totalInvested: { type: Number, default: 0 },
      preferredSectors: [String]
    }
  },
  skills: [
    {
      name: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      },
      verified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: Date,
    },
  ],
  externalLinks: {
    github: String,
    leetcode: String,
    behance: String,
    linkedin: String,
    portfolio: String,
  },
  reputationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1000,
  },
  trustLevel: {
    type: String,
    enum: ['novice', 'contributor', 'expert', 'legend'],
    default: 'novice',
  },
  tokenBalance: {
    type: Number,
    default: 50, // Starting bonus
  },
  goals: [String],
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ reputationScore: -1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ roles: 1 });
userSchema.index({ activeRole: 1 });
userSchema.index({ roleConfirmed: 1 });

// Update trustLevel based on reputation
userSchema.pre('save', function (next) {
  if (this.reputationScore >= 1000) {
    this.trustLevel = 'legend';
  } else if (this.reputationScore >= 500) {
    this.trustLevel = 'expert';
  } else if (this.reputationScore >= 100) {
    this.trustLevel = 'contributor';
  } else {
    this.trustLevel = 'novice';
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);
