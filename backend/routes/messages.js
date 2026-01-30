const express = require('express');
const router = express.Router({ mergeParams: true }); // Allow access to :projectId
const Message = require('../models/Message');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

// Get messages for a project
router.get('/:projectId/messages', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify user is part of the project team or creator
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const isTeamMember = project.team.some(
      (member) => member.userId.toString() === req.userId
    );
    const isCreator = project.creatorId.toString() === req.userId;

    if (!isTeamMember && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You must be a team member to view messages',
      });
    }

    // Fetch messages
    const messages = await Message.find({ projectId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({
      success: true,
      data: {
        messages,
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

module.exports = router;
