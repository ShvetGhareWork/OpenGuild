const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');

/**
 * Get available roles for current user
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.json({
      success: true,
      data: {
        roles: user.roles || ['builder'],
        activeRole: user.activeRole || 'builder',
        roleConfirmed: user.roleConfirmed || false
      }
    });
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch roles' }
    });
  }
});

/**
 * Switch active role
 */
router.post('/switch-role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role is required' }
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Check if user has this role
    if (!user.roles || !user.roles.includes(role)) {
      return res.status(403).json({
        success: false,
        error: { 
          message: `You don't have access to the ${role} role`,
          availableRoles: user.roles
        }
      });
    }

    // Switch active role
    user.activeRole = role;
    await user.save();

    res.json({
      success: true,
      data: {
        activeRole: user.activeRole,
        message: `Switched to ${role} role`
      }
    });
  } catch (err) {
    console.error('Error switching role:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to switch role' }
    });
  }
});

/**
 * Confirm role selection (for first-time users or after migration)
 */
router.post('/confirm-role', authMiddleware, async (req, res) => {
  try {
    const { roles, activeRole } = req.body;

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'At least one role is required' }
      });
    }

    if (!activeRole || !roles.includes(activeRole)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Active role must be one of the selected roles' }
      });
    }

    const validRoles = ['builder', 'mentor', 'investor', 'recruiter'];
    const invalidRoles = roles.filter(r => !validRoles.includes(r));
    
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        success: false,
        error: { 
          message: `Invalid roles: ${invalidRoles.join(', ')}`,
          validRoles
        }
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Update user roles
    user.roles = roles;
    user.activeRole = activeRole;
    user.roleConfirmed = true;
    user.roleConfirmedAt = new Date();
    
    await user.save();

    res.json({
      success: true,
      data: {
        roles: user.roles,
        activeRole: user.activeRole,
        roleConfirmed: user.roleConfirmed,
        message: 'Role selection confirmed successfully'
      }
    });
  } catch (err) {
    console.error('Error confirming role:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to confirm role selection' }
    });
  }
});

/**
 * Add additional role to user
 */
router.post('/add-role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: { message: 'Role is required' }
      });
    }

    const validRoles = ['builder', 'mentor', 'investor', 'recruiter'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: { 
          message: `Invalid role: ${role}`,
          validRoles
        }
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Check if user already has this role
    if (user.roles && user.roles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: { message: `You already have the ${role} role` }
      });
    }

    // Add role
    user.roles = user.roles || [];
    user.roles.push(role);
    await user.save();

    res.json({
      success: true,
      data: {
        roles: user.roles,
        message: `${role} role added successfully`
      }
    });
  } catch (err) {
    console.error('Error adding role:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to add role' }
    });
  }
});

module.exports = router;
