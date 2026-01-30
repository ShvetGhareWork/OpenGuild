const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

// Get team workspace
router.get('/:teamId', authMiddleware, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('members.userId', 'username displayName avatar')
      .populate('tasks.assignedTo', 'username displayName avatar')
      .populate('tasks.createdBy', 'username displayName')
      .populate('messages.senderId', 'username displayName avatar')
      .populate('activities.userId', 'username displayName');

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Team not found',
        },
      });
    }

    // Check if user is a member
    const isMember = team.members.some(
      (m) => m.userId._id.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not a member of this team',
        },
      });
    }

    res.json({
      success: true,
      data: team,
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

// Create task
router.post('/:teamId/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, description, assignedTo, priority } = req.body;

    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Team not found',
        },
      });
    }

    const task = {
      title,
      description,
      assignedTo,
      priority: priority || 'medium',
      status: 'todo',
      createdBy: req.userId,
    };

    team.tasks.push(task);
    await team.save();

    // Add activity
    team.activities.push({
      userId: req.userId,
      type: 'task_created',
      description: `Created task: ${title}`,
    });
    await team.save();

    res.status(201).json({
      success: true,
      data: team.tasks[team.tasks.length - 1],
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

// Update task
router.patch('/:teamId/tasks/:taskId', authMiddleware, async (req, res) => {
  try {
    const { status, assignedTo, priority } = req.body;

    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Team not found',
        },
      });
    }

    const task = team.tasks.id(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found',
        },
      });
    }

    if (status) task.status = status;
    if (assignedTo) task.assignedTo = assignedTo;
    if (priority) task.priority = priority;
    task.updatedAt = new Date();

    await team.save();

    // Add activity
    team.activities.push({
      userId: req.userId,
      type: 'task_updated',
      description: `Updated task: ${task.title}`,
    });
    await team.save();

    res.json({
      success: true,
      data: task,
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

// Get messages
router.get('/:teamId/messages', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const team = await Team.findById(req.params.teamId)
      .populate('messages.senderId', 'username displayName avatar');

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Team not found',
        },
      });
    }

    const messages = team.messages
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(offset, offset + limit);

    res.json({
      success: true,
      data: {
        messages,
        total: team.messages.length,
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

// Post message (also handled by WebSocket)
router.post('/:teamId/messages', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Team not found',
        },
      });
    }

    const message = {
      senderId: req.userId,
      content,
    };

    team.messages.push(message);
    await team.save();

    res.status(201).json({
      success: true,
      data: team.messages[team.messages.length - 1],
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
