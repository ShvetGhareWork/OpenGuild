const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');
const socketLib = require('../lib/io');

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
      error: { code: 'INTERNAL_ERROR', message: error.message },
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
      } catch (err) {}
    }

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

    res.json({ success: true, data: { projects, total } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
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
        error: { code: 'NOT_FOUND', message: 'Project not found' },
      });
    }

    project.views += 1;
    await project.save();

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
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
        error: { code: 'NOT_FOUND', message: 'Project not found' },
      });
    }

    const hasUpvoted = project.upvotedBy.includes(req.userId);

    if (hasUpvoted) {
      project.upvotedBy = project.upvotedBy.filter((id) => id.toString() !== req.userId);
      project.upvotes -= 1;
    } else {
      project.upvotedBy.push(req.userId);
      project.upvotes += 1;
    }

    await project.save();
    socketLib.emitUpvote(req.params.projectId, project.upvotes);

    res.json({ success: true, data: { upvotes: project.upvotes, upvoted: !hasUpvoted } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// ─── Apply for project role ──────────────────────────────────────────────────
router.post('/:projectId/apply', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { roleId, roleName, message } = req.body;

    const project = await Project.findById(projectId)
      .populate('creatorId', 'username displayName email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // ✅ BLOCK: project creator cannot apply to their own project
    if (project.creatorId._id.toString() === req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot apply to your own project.',
      });
    }

    // Check if user already applied for this role
    const existingApplication = project.applications?.find(
      (app) => app.userId.toString() === req.userId && app.roleId === roleId
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this role',
      });
    }

    if (!project.applications) project.applications = [];

    project.applications.push({
      userId: req.userId,
      roleId,
      roleName,
      message: message || 'I would like to join your team!',
      status: 'pending',
      appliedAt: new Date(),
    });

    await project.save();

    // ── Build rich notification for project creator ──────────────────────────
    const Notification = require('../models/Notification');
    const User = require('../models/User');

    const applicant = await User.findById(req.userId)
      .select('username displayName avatar reputationScore skills');

    const applicationId = project.applications[project.applications.length - 1]._id;

    const notification = await Notification.create({
      userId: project.creatorId._id,
      type: 'application_received',
      projectId: project._id,
      projectName: project.name,
      applicationId: applicationId.toString(),
      applicantId: req.userId,
      // Full applicant info so the creator can preview before accepting
      applicantName: applicant?.displayName || applicant?.username || 'Unknown',
      applicantUsername: applicant?.username || '',
      applicantAvatar: applicant?.avatar || '',
      applicantReputation: applicant?.reputationScore || 0,
      applicantSkills: applicant?.skills?.map((s) => s.name || s) || [],
      roleName,
      message: message || 'I would like to join your team!',
      read: false,
    });

    // 🔔 Push live notification to creator's personal room
    socketLib.emitNotification(project.creatorId._id.toString(), notification);

    console.log(`New application from ${applicant?.displayName} for ${roleName} in "${project.name}"`);

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: { applicationId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// ─── Accept or Reject application ────────────────────────────────────────────
router.patch('/:projectId/applications/:applicationId', authMiddleware, async (req, res) => {
  try {
    const { projectId, applicationId } = req.params;
    const { action, message } = req.body; // action: 'accept' | 'reject'

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const creatorId = project.creatorId?._id || project.creatorId;
    if (creatorId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can accept/reject applications',
      });
    }

    const application = project.applications.find(
      (app) => app._id.toString() === applicationId
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been reviewed',
      });
    }

    application.status = action === 'accept' ? 'accepted' : 'rejected';
    application.reviewedAt = new Date();
    application.reviewedBy = req.userId;

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

      // Mark the open role as filled
      const openRole = project.openRoles.find(
        (r) => r.role === application.roleName && !r.filled
      );
      if (openRole) openRole.filled = true;
    }

    await project.save();

    // ✅ Auto-delete the "application_received" notification from creator's feed
    const Notification = require('../models/Notification');
    await Notification.findOneAndDelete({
      type: 'application_received',
      applicationId: applicationId,
      projectId: project._id,
    });

    // Notify the applicant (live + persisted)
    const notif = await Notification.create({
      userId: application.userId,
      type: action === 'accept' ? 'application_accepted' : 'application_rejected',
      projectId: project._id,
      projectName: project.name,
      roleName: application.roleName,
      message:
        message ||
        (action === 'accept'
          ? `Your application for ${application.roleName} has been accepted! 🎉`
          : `Your application for ${application.roleName} was not accepted this time.`),
      read: false,
    });

    socketLib.emitNotification(application.userId.toString(), notif);

    res.json({
      success: true,
      message: `Application ${action}ed successfully`,
      data: { application },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// ─── Get all applications for a project (creator only) ───────────────────────
router.get('/:projectId/applications', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate(
      'applications.userId',
      'username displayName avatar reputationScore skills bio'
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.creatorId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: { applications: project.applications } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// Toggle milestone
router.patch('/:projectId/milestones/:milestoneId', authMiddleware, async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isMember =
      project.team.some((m) => m.userId.toString() === req.userId) ||
      project.creatorId.toString() === req.userId;
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a team member' });

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    milestone.completed = !milestone.completed;
    if (milestone.completed) {
      milestone.completedAt = new Date();
      milestone.completedBy = req.userId;
    } else {
      milestone.completedAt = undefined;
      milestone.completedBy = undefined;
    }

    await project.save();
    socketLib.emitMilestone(projectId, milestone.toObject());

    res.json({ success: true, data: { milestone } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

module.exports = router;