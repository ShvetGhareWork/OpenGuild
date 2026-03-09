const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Application = require('../../models/Application');
const User = require('../../models/User');
const authMiddleware = require('../../middlewares/auth');
const { requireRole, checkPermission } = require('../../middlewares/rbac');

// All builder routes require builder role
router.use(authMiddleware);
router.use(requireRole(['builder']));

/**
 * GET /api/builder/dashboard
 * Get builder dashboard data
 */
router.get('/dashboard', async (req, res) => {
  try {
    const builderId = req.user.userId;

    // Get builder's applications
    const applications = await Application.find({ builderId })
      .populate('projectId', 'name description techStack recruiter workflowStage')
      .sort({ appliedAt: -1 })
      .limit(10);

    // Get assigned projects
    const assignedProjects = await Project.find({ selectedBuilder: builderId })
      .populate('recruiter', 'displayName username avatar')
      .populate('assignedMentor', 'displayName username avatar')
      .sort({ builderSelectedAt: -1 });

    // Get stats
    const stats = {
      totalApplications: await Application.countDocuments({ builderId }),
      pendingApplications: await Application.countDocuments({ builderId, status: 'pending' }),
      acceptedApplications: await Application.countDocuments({ builderId, status: 'accepted' }),
      activeProjects: assignedProjects.filter(p => p.workflowStage !== 'completed').length,
      completedProjects: assignedProjects.filter(p => p.workflowStage === 'completed').length
    };

    res.json({
      success: true,
      data: {
        applications,
        assignedProjects,
        stats
      }
    });
  } catch (err) {
    console.error('Builder dashboard error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch dashboard data' }
    });
  }
});

/**
 * GET /api/builder/projects
 * Browse available projects
 */
router.get('/projects', async (req, res) => {
  try {
    const { techStack, search, page = 1, limit = 20 } = req.query;
    const builderId = req.user.userId;

    // Build query
    const query = {
      workflowStage: 'created', // Only show projects looking for builders
      visibility: 'public'
    };

    if (techStack) {
      query.techStack = { $in: techStack.split(',') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('recruiter', 'displayName username avatar reputationScore')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Check if builder has already applied
    const projectIds = projects.map(p => p._id);
    const existingApplications = await Application.find({
      builderId,
      projectId: { $in: projectIds }
    }).select('projectId status');

    const applicationMap = {};
    existingApplications.forEach(app => {
      applicationMap[app.projectId] = app.status;
    });

    const enhancedProjects = projects.map(project => ({
      ...project.toObject(),
      hasApplied: !!applicationMap[project._id],
      applicationStatus: applicationMap[project._id] || null
    }));

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: {
        projects: enhancedProjects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Browse projects error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch projects' }
    });
  }
});

/**
 * POST /api/builder/projects/:projectId/apply
 * Apply to a project
 */
router.post('/projects/:projectId/apply', checkPermission('application:create'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { proposal, estimatedTime, coverLetter, portfolioLinks } = req.body;

    if (!proposal) {
      return res.status(400).json({
        success: false,
        error: { message: 'Proposal is required' }
      });
    }

    // Verify project exists and is accepting applications
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found' }
      });
    }

    if (project.workflowStage !== 'created') {
      return res.status(400).json({
        success: false,
        error: { message: 'This project is no longer accepting applications' }
      });
    }

    // Create application
    const application = await Application.create({
      projectId,
      builderId: req.user.userId,
      proposal,
      estimatedTime,
      coverLetter,
      portfolioLinks: portfolioLinks || []
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (err) {
    console.error('Apply to project error:', err);
    if (err.code === 'DUPLICATE_APPLICATION') {
      return res.status(400).json({
        success: false,
        error: { message: err.message }
      });
    }
    res.status(500).json({
      success: false,
      error: { message: 'Failed to submit application' }
    });
  }
});

/**
 * GET /api/builder/my-projects
 * Get projects where builder is selected
 */
router.get('/my-projects', async (req, res) => {
  try {
    const builderId = req.user.userId;

    const projects = await Project.find({ selectedBuilder: builderId })
      .populate('recruiter', 'displayName username avatar')
      .populate('assignedMentor', 'displayName username avatar')
      .sort({ builderSelectedAt: -1 });

    res.json({
      success: true,
      data: projects
    });
  } catch (err) {
    console.error('Fetch my projects error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch projects' }
    });
  }
});

/**
 * POST /api/builder/projects/:projectId/submit-progress
 * Submit progress update or deliverable
 */
router.post('/projects/:projectId/submit-progress', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { milestoneId, description, deliverableUrl } = req.body;

    // Verify builder is assigned to this project
    const project = await Project.findOne({ _id: projectId, selectedBuilder: req.user.userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found or access denied' }
      });
    }

    // Update milestone if provided
    if (milestoneId) {
      const milestone = project.milestones.id(milestoneId);
      if (milestone) {
        milestone.completed = true;
        milestone.completedAt = new Date();
        milestone.completedBy = req.user.userId;
      }
    }

    // Update project stage if needed
    if (project.workflowStage === 'builder_selected' || project.workflowStage === 'mentor_assigned') {
      project.workflowStage = 'in_progress';
      project.startedAt = new Date();
    }

    await project.save();

    // Update builder stats
    const completedMilestones = project.milestones.filter(m => m.completed).length;
    if (completedMilestones === project.milestones.length && project.milestones.length > 0) {
      await User.findByIdAndUpdate(req.user.userId, {
        $inc: { 'roleData.builder.projectsCompleted': 1 }
      });
    }

    res.json({
      success: true,
      data: {
        project,
        message: 'Progress submitted successfully'
      }
    });
  } catch (err) {
    console.error('Submit progress error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to submit progress' }
    });
  }
});

/**
 * DELETE /api/builder/applications/:applicationId
 * Withdraw an application
 */
router.delete('/applications/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findOne({
      _id: applicationId,
      builderId: req.user.userId,
      status: 'pending'
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { message: 'Application not found or cannot be withdrawn' }
      });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      data: { message: 'Application withdrawn successfully' }
    });
  } catch (err) {
    console.error('Withdraw application error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to withdraw application' }
    });
  }
});

module.exports = router;
