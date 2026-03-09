const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Application = require('../../models/Application');
const MentorRequest = require('../../models/MentorRequest');
const User = require('../../models/User');
const authMiddleware = require('../../middlewares/auth');
const { requireRole, checkPermission } = require('../../middlewares/rbac');

// All recruiter routes require recruiter role
router.use(authMiddleware);
router.use(requireRole(['recruiter']));

/**
 * GET /api/recruiter/dashboard
 * Get recruiter dashboard data
 */
router.get('/dashboard', async (req, res) => {
  try {
    const recruiterId = req.user.userId;

    // Get recruiter's projects with counts
    const projects = await Project.find({ recruiter: recruiterId })
      .populate('selectedBuilder', 'displayName username avatar')
      .populate('assignedMentor', 'displayName username avatar')
      .sort({ createdAt: -1 });

    // Get application counts per project
    const projectIds = projects.map(p => p._id);
    const applications = await Application.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { 
          _id: '$projectId', 
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);

    const applicationMap = {};
    applications.forEach(app => {
      applicationMap[app._id] = { pending: app.pending, total: app.total };
    });

    // Get mentor request counts
    const mentorRequests = await MentorRequest.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { 
          _id: '$projectId', 
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
        }
      }
    ]);

    const mentorRequestMap = {};
    mentorRequests.forEach(mr => {
      mentorRequestMap[mr._id] = mr.pending;
    });

    // Enhance projects with counts
    const enhancedProjects = projects.map(project => ({
      ...project.toObject(),
      applicationStats: applicationMap[project._id] || { pending: 0, total: 0 },
      pendingMentorRequests: mentorRequestMap[project._id] || 0
    }));

    // Get overall stats
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.workflowStage !== 'completed').length,
      completedProjects: projects.filter(p => p.workflowStage === 'completed').length,
      pendingApplications: Object.values(applicationMap).reduce((sum, app) => sum + app.pending, 0)
    };

    res.json({
      success: true,
      data: {
        projects: enhancedProjects,
        stats
      }
    });
  } catch (err) {
    console.error('Recruiter dashboard error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch dashboard data' }
    });
  }
});

/**
 * POST /api/recruiter/projects
 * Create a new project
 */
router.post('/projects', checkPermission('project:create'), async (req, res) => {
  try {
    const { name, description, vision, techStack, openRoles, milestones, visibility } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: { message: 'Name and description are required' }
      });
    }

    const project = await Project.create({
      name,
      description,
      vision,
      techStack: techStack || [],
      openRoles: openRoles || [],
      milestones: milestones || [],
      visibility: visibility || 'public',
      creatorId: req.user.userId,
      recruiter: req.user.userId,
      workflowStage: 'created'
    });

    // Update recruiter stats
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { 'roleData.recruiter.projectsCreated': 1 }
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error('Project creation error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create project' }
    });
  }
});

/**
 * GET /api/recruiter/projects/:projectId/applications
 * View applications for a project
 */
router.get('/projects/:projectId/applications', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project belongs to recruiter
    const project = await Project.findOne({ _id: projectId, recruiter: req.user.userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found or access denied' }
      });
    }

    const applications = await Application.find({ projectId })
      .populate('builderId', 'displayName username avatar skills reputationScore')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (err) {
    console.error('Fetch applications error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch applications' }
    });
  }
});

/**
 * POST /api/recruiter/projects/:projectId/select-builder
 * Select a builder for the project
 */
router.post('/projects/:projectId/select-builder', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { applicationId } = req.body;

    // Verify project belongs to recruiter
    const project = await Project.findOne({ _id: projectId, recruiter: req.user.userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found or access denied' }
      });
    }

    // Get application
    const application = await Application.findById(applicationId);
    if (!application || application.projectId.toString() !== projectId) {
      return res.status(404).json({
        success: false,
        error: { message: 'Application not found' }
      });
    }

    // Update project
    project.selectedBuilder = application.builderId;
    project.builderSelectedAt = new Date();
    project.workflowStage = 'builder_selected';
    await project.save();

    // Update application status
    application.status = 'accepted';
    application.respondedAt = new Date();
    application.respondedBy = req.user.userId;
    await application.save();

    // Reject other applications
    await Application.updateMany(
      { projectId, _id: { $ne: applicationId }, status: 'pending' },
      { status: 'rejected', respondedAt: new Date(), respondedBy: req.user.userId }
    );

    // Update recruiter stats
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { 'roleData.recruiter.buildersHired': 1 }
    });

    res.json({
      success: true,
      data: {
        project,
        application,
        message: 'Builder selected successfully'
      }
    });
  } catch (err) {
    console.error('Select builder error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to select builder' }
    });
  }
});

/**
 * POST /api/recruiter/projects/:projectId/request-mentor
 * Request a mentor for the project
 */
router.post('/projects/:projectId/request-mentor', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { mentorId, message, mentorshipAreas, expectedDuration } = req.body;

    // Verify project belongs to recruiter
    const project = await Project.findOne({ _id: projectId, recruiter: req.user.userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found or access denied' }
      });
    }

    // Verify mentor exists and has mentor role
    const mentor = await User.findById(mentorId);
    if (!mentor || !mentor.roles.includes('mentor')) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid mentor' }
      });
    }

    // Create mentor request
    const mentorRequest = await MentorRequest.create({
      projectId,
      mentorId,
      requestedBy: req.user.userId,
      message,
      projectDescription: project.description,
      mentorshipAreas: mentorshipAreas || [],
      expectedDuration
    });

    res.status(201).json({
      success: true,
      data: mentorRequest
    });
  } catch (err) {
    console.error('Request mentor error:', err);
    if (err.code === 'DUPLICATE_MENTOR_REQUEST') {
      return res.status(400).json({
        success: false,
        error: { message: err.message }
      });
    }
    res.status(500).json({
      success: false,
      error: { message: 'Failed to request mentor' }
    });
  }
});

module.exports = router;
