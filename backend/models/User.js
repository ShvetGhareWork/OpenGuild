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

  // RBAC
  roles: {
    type: [String],
    enum: ['builder', 'mentor', 'investor', 'recruiter'],
    default: ['builder'],
    validate: {
      validator: function (roles) { return roles && roles.length > 0; },
      message: 'User must have at least one role',
    },
  },
  activeRole: {
    type: String,
    enum: ['builder', 'mentor', 'investor', 'recruiter'],
    default: 'builder',
  },
  roleConfirmed: { type: Boolean, default: false },
  roleConfirmedAt: Date,

  roleData: {
    recruiter: {
      company: String,
      projectsCreated: { type: Number, default: 0 },
      buildersHired: { type: Number, default: 0 },
    },
    builder: {
      projectsCompleted: { type: Number, default: 0 },
      specializations: [String],
      availability: {
        type: String,
        enum: ['full-time', 'part-time', 'weekends', 'unavailable'],
        default: 'part-time',
      },
    },
    mentor: {
      expertise: [String],
      projectsMentored: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
    },
    investor: {
      investmentCapacity: Number,
      investmentsMade: { type: Number, default: 0 },
      totalInvested: { type: Number, default: 0 },
      preferredSectors: [String],
    },
  },

  skills: [
    {
      name: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      },
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
    },
  ],

  // ── Work Experience ──────────────────────────────────────────────────────
  workExperience: [
    {
      company: { type: String, required: true },
      role: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: Date,           // null = current
      current: { type: Boolean, default: false },
      description: String,
      skills: [String],        // skills used in this role
    },
  ],

  // ── Certifications & Courses ─────────────────────────────────────────────
  certifications: [
    {
      title: { type: String, required: true },
      issuer: { type: String, required: true },   // e.g. "Coursera", "AWS", "Google"
      issueDate: Date,
      expiryDate: Date,
      credentialUrl: String,   // link to verify online
      fileUrl: String,         // uploaded certificate file path
      fileName: String,
    },
  ],

  // ── Resume ───────────────────────────────────────────────────────────────
  resume: {
    fileUrl: String,           // path to uploaded PDF
    fileName: String,
    uploadedAt: Date,
  },

  // ── Validation score (0-100) based on completeness ───────────────────────
  // Auto-computed: skills + experience + certs + resume + github link
  validationScore: { type: Number, default: 0, min: 0, max: 100 },

  externalLinks: {
    github: String,
    leetcode: String,
    behance: String,
    linkedin: String,
    portfolio: String,
  },
  reputationScore: { type: Number, default: 0, min: 0, max: 1000 },
  trustLevel: {
    type: String,
    enum: ['novice', 'contributor', 'expert', 'legend'],
    default: 'novice',
  },
  tokenBalance: { type: Number, default: 50 },
  goals: [String],
  onboardingCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ reputationScore: -1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ roles: 1 });
userSchema.index({ activeRole: 1 });
userSchema.index({ validationScore: -1 });

// ── Pre-save: update trustLevel + compute validationScore ──────────────────
userSchema.pre('save', function (next) {
  // Trust level
  if (this.reputationScore >= 1000) this.trustLevel = 'legend';
  else if (this.reputationScore >= 500) this.trustLevel = 'expert';
  else if (this.reputationScore >= 100) this.trustLevel = 'contributor';
  else this.trustLevel = 'novice';

  // Validation score (recruiter-facing credibility signal)
  let score = 0;
  if (this.skills?.length >= 3) score += 20;
  else if (this.skills?.length >= 1) score += 10;

  if (this.workExperience?.length >= 2) score += 25;
  else if (this.workExperience?.length === 1) score += 15;

  if (this.certifications?.length >= 2) score += 25;
  else if (this.certifications?.length === 1) score += 15;

  if (this.resume?.fileUrl) score += 20;
  if (this.externalLinks?.github) score += 5;
  if (this.externalLinks?.linkedin) score += 5;

  this.validationScore = Math.min(score, 100);
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);