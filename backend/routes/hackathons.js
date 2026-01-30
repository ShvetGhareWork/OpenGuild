const express = require('express');
const router = express.Router();
const Hackathon = require('../models/Hackathon');
const authMiddleware = require('../middleware/auth');

// Get all hackathons
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const hackathons = await Hackathon.find(query)
      .populate('organizerId', 'username displayName avatar')
      .sort({ startDate: -1 });

    res.json({
      success: true,
      data: {
        hackathons,
        total: hackathons.length,
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

// Get hackathon by ID
router.get('/:hackathonId', async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.hackathonId)
      .populate('organizerId', 'username displayName avatar')
      .populate('participants.userId', 'username displayName avatar')
      .populate('submissions.userId', 'username displayName avatar')
      .populate('submissions.projectId', 'name slug');

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Hackathon not found',
        },
      });
    }

    res.json({
      success: true,
      data: hackathon,
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

// Create hackathon
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      theme,
      startDate,
      endDate,
      prizes,
      rules,
      judging,
      maxParticipants,
    } = req.body;

    const hackathon = new Hackathon({
      name,
      description,
      theme,
      organizerId: req.userId,
      startDate,
      endDate,
      prizes,
      rules,
      judging,
      maxParticipants,
    });

    await hackathon.save();

    res.status(201).json({
      success: true,
      data: hackathon,
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

// Join hackathon
router.post('/:hackathonId/join', authMiddleware, async (req, res) => {
  try {
    const { teamName } = req.body;

    const hackathon = await Hackathon.findById(req.params.hackathonId);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Hackathon not found',
        },
      });
    }

    // Check if already joined
    const alreadyJoined = hackathon.participants.some(
      p => p.userId.toString() === req.userId
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_JOINED',
          message: 'Already joined this hackathon',
        },
      });
    }

    // Check max participants
    if (hackathon.maxParticipants && hackathon.participants.length >= hackathon.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'HACKATHON_FULL',
          message: 'Hackathon is full',
        },
      });
    }

    hackathon.participants.push({
      userId: req.userId,
      teamName,
    });

    await hackathon.save();

    res.json({
      success: true,
      data: hackathon,
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

// Submit project
router.post('/:hackathonId/submit', authMiddleware, async (req, res) => {
  try {
    const { projectId, title, description, demoUrl, repoUrl } = req.body;

    const hackathon = await Hackathon.findById(req.params.hackathonId);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Hackathon not found',
        },
      });
    }

    // Check if participant
    const isParticipant = hackathon.participants.some(
      p => p.userId.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NOT_PARTICIPANT',
          message: 'Must join hackathon before submitting',
        },
      });
    }

    hackathon.submissions.push({
      userId: req.userId,
      projectId,
      title,
      description,
      demoUrl,
      repoUrl,
    });

    await hackathon.save();

    res.status(201).json({
      success: true,
      data: hackathon.submissions[hackathon.submissions.length - 1],
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

module.exports = router;
