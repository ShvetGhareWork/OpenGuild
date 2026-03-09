const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');

// Get platform statistics
router.get('/', async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get total projects count
    const totalProjects = await Project.countDocuments();
    
    // Get completed projects count
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    
    // Calculate success rate
    const successRate = totalProjects > 0 
      ? Math.round((completedProjects / totalProjects) * 100) 
      : 0;
    
    // Get total milestones (sum of all milestones from all projects)
    const projectsWithMilestones = await Project.aggregate([
      { $project: { milestoneCount: { $size: { $ifNull: ['$milestones', []] } } } },
      { $group: { _id: null, total: { $sum: '$milestoneCount' } } }
    ]);
    const totalMilestones = projectsWithMilestones.length > 0 
      ? projectsWithMilestones[0].total 
      : 0;
    
    // Get total funding (this is a placeholder - you'd need to add a funding field to projects)
    // For now, we'll calculate based on number of projects * average funding
    const totalFunding = totalProjects * 4000; // Placeholder calculation
    
    // Format numbers for display
    const formatNumber = (num) => {
      if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M+`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
      return `${num}+`;
    };

    res.json({
      success: true,
      data: {
        activeBuilders: totalUsers,
        activeBuildersFormatted: formatNumber(totalUsers),
        projectsShipped: completedProjects,
        projectsShippedFormatted: formatNumber(completedProjects),
        totalMilestones: totalMilestones,
        totalMilestonesFormatted: formatNumber(totalMilestones),
        totalFunding: totalFunding,
        totalFundingFormatted: formatNumber(totalFunding),
        successRate: successRate,
        successRateFormatted: `${successRate}%`
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch platform statistics' }
    });
  }
});

module.exports = router;
