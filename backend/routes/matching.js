const express = require('express');
const router = express.Router();
const { findMatchingProjects, findMatchingMembers } = require('../utils/matching');
const authMiddleware = require('../middleware/auth');

// Get project recommendations for current user
router.get('/projects', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);

    const matches = await findMatchingProjects(req.userId, limit);

    res.json({
      success: true,
      data: {
        matches,
        total: matches.length,
      },
    });
  } catch (error) {
    console.error('Get project matches error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  }
});

// Get team member recommendations for a project
router.get('/members/:projectId', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);

    const matches = await findMatchingMembers(req.params.projectId, limit);

    res.json({
      success: true,
      data: {
        matches,
        total: matches.length,
      },
    });
  } catch (error) {
    console.error('Get member matches error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  }
});

module.exports = router;
