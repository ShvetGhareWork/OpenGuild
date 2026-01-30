const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

// Create project
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, vision, techStack, openRoles, visibility } = req.body;

    const project = new Project({
      name,
      description,
      vision,
      techStack,
      openRoles,
      visibility: visibility || 'public',
      creatorId: req.userId,
      team: [
        {
          userId: req.userId,
          role: 'founder',
        },
      ],
    });

    await project.save();

    res.status(201).json({
      success: true,
      data: project,
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

// Get all projects
router.get('/', async (req, res) => {
  try {
    const { status, techStack, sort, limit = 20, offset = 0 } = req.query;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    let userId = null;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
      } catch (err) {
        // Invalid token, continue as unauthenticated user
      }
    }

    // Build query: show public projects + user's own private projects
    const query = userId 
      ? { $or: [{ visibility: 'public' }, { visibility: 'private', creatorId: userId }] }
      : { visibility: 'public' };

    if (status) query.status = status;
    if (techStack) query.techStack = { $in: techStack.split(',') };

    let sortOption = { createdAt: -1 };
    if (sort === 'trending') sortOption = { upvotes: -1, createdAt: -1 };
    if (sort === 'upvotes') sortOption = { upvotes: -1 };

    const projects = await Project.find(query)
      .populate('creatorId', 'username displayName avatar')
      .sort(sortOption)
      .skip(parseInt(offset))
      .limit(Math.min(parseInt(limit), 50));

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: {
        projects,
        total,
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

// Get project by ID
router.get('/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('creatorId', 'username displayName avatar reputationScore')
      .populate('team.userId', 'username displayName avatar reputationScore');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        },
      });
    }

    // Increment views
    project.views += 1;
    await project.save();

    res.json({
      success: true,
      data: project,
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

// Upvote project
router.post('/:projectId/upvote', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        },
      });
    }

    const hasUpvoted = project.upvotedBy.includes(req.userId);

    if (hasUpvoted) {
      // Remove upvote
      project.upvotedBy = project.upvotedBy.filter(
        (id) => id.toString() !== req.userId
      );
      project.upvotes -= 1;
    } else {
      // Add upvote
      project.upvotedBy.push(req.userId);
      project.upvotes += 1;
    }

    await project.save();

    res.json({
      success: true,
      data: {
        upvotes: project.upvotes,
        upvoted: !hasUpvoted,
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

// Apply for project role
router.post('/:projectId/apply', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { roleId, roleName, message } = req.body;

    const project = await Project.findById(projectId).populate('creatorId', 'username displayName email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user already applied
    const existingApplication = project.applications?.find(
      (app) => app.userId.toString() === req.userId && app.roleId === roleId
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this role',
      });
    }

    // Add application
    if (!project.applications) {
      project.applications = [];
    }

    project.applications.push({
      userId: req.userId,
      roleId,
      roleName,
      message: message || 'I would like to join your team!',
      status: 'pending',
      appliedAt: new Date(),
    });

    await project.save();

    // Create notification for project creator
    const Notification = require('../models/Notification');
    const User = require('../models/User');
    
    const applicant = await User.findById(req.userId).select('username displayName');
    
    const applicationId = project.applications[project.applications.length - 1]._id;
    
    await Notification.create({
      userId: project.creatorId._id,
      type: 'application_received',
      projectId: project._id,
      projectName: project.name,
      applicationId: applicationId.toString(),
      applicantId: req.userId,
      applicantName: applicant?.displayName || applicant?.username || 'Unknown',
      roleName,
      message: message || 'I would like to join your team!',
      read: false,
    });

    console.log(`New application from user ${req.userId} for ${roleName} in project ${project.name}`);

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: project.applications[project.applications.length - 1]._id,
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

// Accept or reject application
router.patch('/:projectId/applications/:applicationId', authMiddleware, async (req, res) => {
  try {
    const { projectId, applicationId } = req.params;
    const { action, message } = req.body; // action: 'accept' or 'reject'

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is project creator
    if (project.creatorId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only project creator can accept/reject applications',
      });
    }

    // Find application
    const application = project.applications.find(
      (app) => app._id.toString() === applicationId
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been reviewed',
      });
    }

    // Update application status
    application.status = action === 'accept' ? 'accepted' : 'rejected';
    application.reviewedAt = new Date();
    application.reviewedBy = req.userId;

    // If accepted, add user to team
    if (action === 'accept') {
      const alreadyInTeam = project.team.some(
        (member) => member.userId.toString() === application.userId.toString()
      );

      if (!alreadyInTeam) {
        project.team.push({
          userId: application.userId,
          role: application.roleName,
          joinedAt: new Date(),
        });
      }
    }

    await project.save();

    // Create notification for applicant
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: application.userId,
      type: action === 'accept' ? 'application_accepted' : 'application_rejected',
      projectId: project._id,
      projectName: project.name,
      roleName: application.roleName,
      message: message || (action === 'accept' 
        ? `Your application for ${application.roleName} has been accepted!` 
        : `Your application for ${application.roleName} was not accepted this time.`),
    });

    res.json({
      success: true,
      message: `Application ${action}ed successfully`,
      data: {
        application,
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
