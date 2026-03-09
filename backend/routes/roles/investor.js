const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Investment = require('../../models/Investment');
const User = require('../../models/User');
const authMiddleware = require('../../middlewares/auth');
const { requireRole, checkPermission } = require('../../middlewares/rbac');

// All investor routes require investor role
router.use(authMiddleware);
router.use(requireRole(['investor']));

/**
 * GET /api/investor/dashboard
 * Get investor dashboard data
 */
router.get('/dashboard', async (req, res) => {
  try {
    const investorId = req.user.userId;

    // Get investments
    const investments = await Investment.find({ investorId })
      .populate('projectId', 'name description workflowStage recruiter selectedBuilder')
      .sort({ investedAt: -1 })
      .limit(20);

    // Calculate portfolio stats
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const activeInvestments = investments.filter(inv => inv.status === 'active').length;
    const completedInvestments = investments.filter(inv => inv.status === 'completed').length;
    
    // Calculate total ROI
    let totalCurrentValue = 0;
    investments.forEach(inv => {
      if (inv.roi && inv.roi.currentValue) {
        totalCurrentValue += inv.roi.currentValue;
      } else {
        totalCurrentValue += inv.amount; // Use invested amount if no ROI data
      }
    });
    const portfolioROI = totalInvested > 0 
      ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 
      : 0;

    const stats = {
      totalInvestments: investments.length,
      activeInvestments,
      completedInvestments,
      totalInvested,
      totalCurrentValue,
      portfolioROI: portfolioROI.toFixed(2)
    };

    res.json({
      success: true,
      data: {
        investments,
        stats
      }
    });
  } catch (err) {
    console.error('Investor dashboard error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch dashboard data' }
    });
  }
});

/**
 * GET /api/investor/projects
 * View approved projects available for investment
 */
router.get('/projects', checkPermission('project:view_approved'), async (req, res) => {
  try {
    const { techStack, minStage, search, page = 1, limit = 20 } = req.query;

    // Build query - only show projects that have a builder and optionally a mentor
    const query = {
      workflowStage: { $in: ['builder_selected', 'mentor_assigned', 'in_progress'] },
      visibility: 'public',
      selectedBuilder: { $exists: true }
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
      .populate('selectedBuilder', 'displayName username avatar reputationScore skills')
      .populate('assignedMentor', 'displayName username avatar')
      .sort({ builderSelectedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Check if investor has already invested
    const projectIds = projects.map(p => p._id);
    const existingInvestments = await Investment.find({
      investorId: req.user.userId,
      projectId: { $in: projectIds }
    }).select('projectId amount status');

    const investmentMap = {};
    existingInvestments.forEach(inv => {
      investmentMap[inv.projectId] = {
        amount: inv.amount,
        status: inv.status
      };
    });

    const enhancedProjects = projects.map(project => ({
      ...project.toObject(),
      hasInvested: !!investmentMap[project._id],
      investment: investmentMap[project._id] || null
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
 * POST /api/investor/projects/:projectId/invest
 * Invest in a project
 */
router.post('/projects/:projectId/invest', checkPermission('investment:create'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { amount, terms, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid investment amount is required' }
      });
    }

    // Verify project exists and is eligible for investment
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found' }
      });
    }

    if (!['builder_selected', 'mentor_assigned', 'in_progress'].includes(project.workflowStage)) {
      return res.status(400).json({
        success: false,
        error: { message: 'This project is not ready for investment' }
      });
    }

    // Create investment
    const investment = await Investment.create({
      projectId,
      investorId: req.user.userId,
      amount,
      terms: terms || {},
      notes,
      status: 'active'
    });

    // Update project workflow
    if (project.workflowStage !== 'funded') {
      project.workflowStage = 'funded';
      project.fundedAt = new Date();
      await project.save();
    }

    // Update investor stats
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { 
        'roleData.investor.investmentsMade': 1,
        'roleData.investor.totalInvested': amount
      }
    });

    res.status(201).json({
      success: true,
      data: investment
    });
  } catch (err) {
    console.error('Investment error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create investment' }
    });
  }
});

/**
 * GET /api/investor/investments
 * Get investor's investments
 */
router.get('/investments', async (req, res) => {
  try {
    const { status } = req.query;
    const investorId = req.user.userId;

    const query = { investorId };
    if (status) {
      query.status = status;
    }

    const investments = await Investment.find(query)
      .populate('projectId', 'name description workflowStage recruiter selectedBuilder milestones')
      .sort({ investedAt: -1 });

    res.json({
      success: true,
      data: investments
    });
  } catch (err) {
    console.error('Fetch investments error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch investments' }
    });
  }
});

/**
 * PUT /api/investor/investments/:investmentId/roi
 * Update ROI for an investment
 */
router.put('/investments/:investmentId/roi', async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { currentValue } = req.body;

    if (!currentValue || currentValue < 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid current value is required' }
      });
    }

    const investment = await Investment.findOne({
      _id: investmentId,
      investorId: req.user.userId
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Investment not found' }
      });
    }

    await investment.updateROI(currentValue);

    res.json({
      success: true,
      data: {
        investment,
        message: 'ROI updated successfully'
      }
    });
  } catch (err) {
    console.error('Update ROI error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update ROI' }
    });
  }
});

/**
 * POST /api/investor/projects/:projectId/bid
 * Place a bid on a project (future feature)
 */
router.post('/projects/:projectId/bid', checkPermission('bid:create'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { bidAmount } = req.body;

    // This is a placeholder for future bidding functionality
    res.status(501).json({
      success: false,
      error: { message: 'Bidding feature coming soon' }
    });
  } catch (err) {
    console.error('Bid error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to place bid' }
    });
  }
});

module.exports = router;
