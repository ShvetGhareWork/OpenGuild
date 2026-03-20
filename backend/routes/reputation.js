const express = require('express');
const router = express.Router();
const Contribution = require('../models/Contribution');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const Endorsement = require('../models/Endorsement');

// Calculate reputation impact score
const calculateImpactScore = (type, metadata = {}) => {
  const baseScores = {
    milestone_completed: 80,
    code_contribution: 50,
    mentorship_session: 60,
    project_created: 70,
    team_joined: 30,
    hackathon_participation: 40,
    hackathon_win: 100,
    upvote_received: 10,
    skill_verified: 20,
  };

  let score = baseScores[type] || 0;

  // Adjust based on metadata
  if (metadata.complexity === 'high') score *= 1.5;
  if (metadata.complexity === 'medium') score *= 1.2;
  if (metadata.teamSize > 5) score *= 1.3;
  if (metadata.upvotes > 10) score *= 1.2;

  return Math.min(Math.round(score), 100);
};

// Calculate reputation earned from impact score
const calculateReputationEarned = (impactScore) => {
  return Math.round(impactScore * 0.5); // 50% conversion rate
};

// Add contribution
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, description, projectId, metadata } = req.body;

    const impactScore = calculateImpactScore(type, metadata);
    const reputationEarned = calculateReputationEarned(impactScore);

    const contribution = new Contribution({
      userId: req.userId,
      projectId,
      type,
      description,
      impactScore,
      reputationEarned,
      metadata,
      verifiedBy: 'ai', // AI verification by default
    });

    await contribution.save();

    // Update user reputation
    const user = await User.findById(req.userId);
    user.reputationScore += reputationEarned;
    await user.save();

    // Update Redis leaderboard
    const { cache } = require('../utils/cache');
    await cache.updateLeaderboard(req.userId, user.reputationScore);

    res.status(201).json({
      success: true,
      data: {
        contribution,
        newReputationScore: user.reputationScore,
        trustLevel: user.trustLevel,
      },
    });
  } catch (error) {
    console.error('Add contribution error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  }
});

// Get user contributions
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const contributions = await Contribution.find({ userId: req.userId })
      .populate('projectId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const total = await Contribution.countDocuments({ userId: req.userId });

    // Calculate total reputation earned
    const totalReputation = contributions.reduce(
      (sum, c) => sum + c.reputationEarned,
      0
    );

    // Get skill breakdown
    const user = await User.findById(req.userId);
    const skillGraph = {};
    user.skills.forEach((skill) => {
      skillGraph[skill.name] = {
        level: skill.level,
        verified: skill.verified,
        score: skill.verified ? 90 : 60,
      };
    });

    res.json({
      success: true,
      data: {
        contributions,
        total,
        totalReputation,
        skillGraph,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  }
});

// Get reputation breakdown
router.get('/breakdown', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const contributions = await Contribution.find({ userId: req.userId });

    // Group by type
    const breakdown = {};
    contributions.forEach((c) => {
      if (!breakdown[c.type]) {
        breakdown[c.type] = {
          count: 0,
          totalReputation: 0,
          avgImpact: 0,
        };
      }
      breakdown[c.type].count++;
      breakdown[c.type].totalReputation += c.reputationEarned;
      breakdown[c.type].avgImpact += c.impactScore;
    });

    // Calculate averages
    Object.keys(breakdown).forEach((type) => {
      breakdown[type].avgImpact = Math.round(
        breakdown[type].avgImpact / breakdown[type].count
      );
    });

    res.json({
      success: true,
      data: {
        reputationScore: user.reputationScore,
        trustLevel: user.trustLevel,
        breakdown,
        totalContributions: contributions.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  }
});

// Add Peer Endorsement
router.post('/endorse', authMiddleware, async (req, res) => {
  try {
    const { toUserId, projectId, content, rating, skills } = req.body;

    if (toUserId === req.userId) {
      return res.status(400).json({ success: false, message: 'You cannot endorse yourself' });
    }

    const endorsement = new Endorsement({
      fromUserId: req.userId,
      toUserId,
      projectId,
      content,
      rating,
      skills,
    });

    await endorsement.save();

    // Update recipient's reputation
    const user = await User.findById(toUserId);
    if (user) {
      const reputationGain = rating * 10; // e.g. 5 stars = 50 reputation
      user.reputationScore += reputationGain;
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: {
        endorsement,
        newReputationScore: user?.reputationScore,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

module.exports = router;
