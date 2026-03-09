const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const MentorRequest = require('../../models/MentorRequest');
const User = require('../../models/User');
const authMiddleware = require('../../middlewares/auth');
const { requireRole, checkPermission } = require('../../middlewares/rbac');

// All mentor routes require mentor role
router.use(authMiddleware);
router.use(requireRole(['mentor']));

/**
 * GET /api/mentor/dashboard
 * Get mentor dashboard data
 */
router.get('/dashboard', async (req, res) => {
  try {
    const mentorId = req.user.userId;

    // Get mentor requests
    const requests = await MentorRequest.find({ mentorId })
      .populate('projectId', 'name description techStack workflowStage')
      .populate('requestedBy', 'displayName username avatar')
      .sort({ requestedAt: -1 })
      .limit(20);

    // Get assigned projects
    const assignedProjects = await Project.find({ assignedMentor: mentorId })
      .populate('recruiter', 'displayName username avatar')
      .populate('selectedBuilder', 'displayName username avatar')
      .sort({ mentorAssignedAt: -1 });

    // Get stats
    const stats = {
      pendingRequests: await MentorRequest.countDocuments({ mentorId, status: 'pending' }),
      acceptedRequests: await MentorRequest.countDocuments({ mentorId, status: 'accepted' }),
      activeProjects: assignedProjects.filter(p => p.workflowStage !== 'completed').length,
      completedProjects: assignedProjects.filter(p => p.workflowStage === 'completed').length,
      totalProjectsMentored: assignedProjects.length
    };

    res.json({
      success: true,
      data: {
        requests,
        assignedProjects,
        stats
      }
    });
  } catch (err) {
    console.error('Mentor dashboard error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch dashboard data' }
    });
  }
});

/**
 * GET /api/mentor/requests
 * Get mentor requests
 */
router.get('/requests', async (req, res) => {
  try {
    const { status } = req.query;
    const mentorId = req.user.userId;

    const query = { mentorId };
    if (status) {
      query.status = status;
    }

    const requests = await MentorRequest.find(query)
      .populate('projectId', 'name description techStack workflowStage milestones')
      .populate('requestedBy', 'displayName username avatar reputationScore')
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (err) {
    console.error('Fetch mentor requests error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch mentor requests' }
    });
  }
});

/**
 * POST /api/mentor/requests/:requestId/respond
 * Accept or decline a mentor request
 */
router.post('/requests/:requestId/respond', checkPermission('mentor_request:accept'), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, declineReason } = req.body; // action: 'accept' or 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid action. Must be "accept" or "decline"' }
      });
    }

    const mentorRequest = await MentorRequest.findOne({
      _id: requestId,
      mentorId: req.user.userId,
      status: 'pending'
    });

    if (!mentorRequest) {
      return res.status(404).json({
        success: false,
        error: { message: 'Mentor request not found or already responded' }
      });
    }

    mentorRequest.status = action === 'accept' ? 'accepted' : 'declined';
    mentorRequest.respondedAt = new Date();
    if (action === 'decline' && declineReason) {
      mentorRequest.declineReason = declineReason;
    }
    await mentorRequest.save();

    // If accepted, update project
    if (action === 'accept') {
      const project = await Project.findById(mentorRequest.projectId);
      if (project) {
        project.assignedMentor = req.user.userId;
        project.mentorAssignedAt = new Date();
        project.workflowStage = 'mentor_assigned';
        await project.save();

        // Update mentor stats
        await User.findByIdAndUpdate(req.user.userId, {
          $inc: { 'roleData.mentor.projectsMentored': 1 }
        });
      }
    }

    res.json({
      success: true,
      data: {
        mentorRequest,
        message: `Mentor request ${action}ed successfully`
      }
    });
  } catch (err) {
    console.error('Respond to mentor request error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to respond to mentor request' }
    });
  }
});

/**
 * GET /api/mentor/projects
 * Get projects where mentor is assigned
 */
router.get('/projects', async (req, res) => {
  try {
    const mentorId = req.user.userId;

    const projects = await Project.find({ assignedMentor: mentorId })
      .populate('recruiter', 'displayName username avatar')
      .populate('selectedBuilder', 'displayName username avatar skills')
      .sort({ mentorAssignedAt: -1 });

    res.json({
      success: true,
      data: projects
    });
  } catch (err) {
    console.error('Fetch mentor projects error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch projects' }
    });
  }
});

/**
 * POST /api/mentor/projects/:projectId/feedback
 * Provide feedback on a project
 */
router.post('/projects/:projectId/feedback', checkPermission('feedback:create'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content, milestone } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: { message: 'Feedback content is required' }
      });
    }

    // Verify mentor is assigned to this project
    const project = await Project.findOne({ _id: projectId, assignedMentor: req.user.userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found or access denied' }
      });
    }

    // Find the mentor request to add feedback
    const mentorRequest = await MentorRequest.findOne({
      projectId,
      mentorId: req.user.userId,
      status: 'accepted'
    });

    if (!mentorRequest) {
      return res.status(404).json({
        success: false,
        error: { message: 'Mentor request not found' }
      });
    }

    // Add feedback
    mentorRequest.feedback.push({
      content,
      milestone,
      createdAt: new Date()
    });
    await mentorRequest.save();

    res.json({
      success: true,
      data: {
        feedback: mentorRequest.feedback[mentorRequest.feedback.length - 1],
        message: 'Feedback submitted successfully'
      }
    });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to submit feedback' }
    });
  }
});

/**
 * GET /api/mentor/projects/:projectId/feedback
 * Get all feedback for a project
 */
router.get('/projects/:projectId/feedback', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify mentor is assigned to this project
    const project = await Project.findOne({ _id: projectId, assignedMentor: req.user.userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found or access denied' }
      });
    }

    const mentorRequest = await MentorRequest.findOne({
      projectId,
      mentorId: req.user.userId,
      status: 'accepted'
    });

    res.json({
      success: true,
      data: {
        feedback: mentorRequest?.feedback || []
      }
    });
  } catch (err) {
    console.error('Fetch feedback error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch feedback' }
    });
  }
});

module.exports = router;
