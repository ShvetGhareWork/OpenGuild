const jwt = require('jsonwebtoken');

/**
 * RBAC Middleware
 * Enforces role-based access control for protected routes
 */

/**
 * Middleware to require specific roles
 * @param {Array<string>} allowedRoles - Array of allowed roles ['recruiter', 'builder', 'mentor', 'investor']
 * @returns {Function} Express middleware
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    // Check if user has an active role
    if (!req.user.activeRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NO_ACTIVE_ROLE',
          message: 'Please select an active role to continue'
        }
      });
    }

    // Check if user's active role is in allowed roles
    if (!allowedRoles.includes(req.user.activeRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `This action requires one of the following roles: ${allowedRoles.join(', ')}. Your active role is: ${req.user.activeRole}`
        }
      });
    }

    next();
  };
};

/**
 * Middleware to check specific permissions
 * @param {string} permission - Permission string (e.g., 'project:create', 'application:view')
 * @returns {Function} Express middleware
 */
const checkPermission = (permission) => {
  // Permission mapping by role
  const rolePermissions = {
    recruiter: [
      'project:create',
      'project:view',
      'project:update',
      'project:delete',
      'application:view',
      'application:accept',
      'application:reject',
      'mentor:request',
      'progress:view'
    ],
    builder: [
      'project:view',
      'application:create',
      'application:view_own',
      'project:build',
      'progress:submit',
      'deliverable:submit'
    ],
    mentor: [
      'mentor_request:view',
      'mentor_request:accept',
      'mentor_request:decline',
      'project:view_assigned',
      'feedback:create',
      'progress:review'
    ],
    investor: [
      'project:view_approved',
      'investment:create',
      'investment:view_own',
      'bid:create',
      'roi:track'
    ]
  };

  return (req, res, next) => {
    if (!req.user || !req.user.activeRole) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const userPermissions = rolePermissions[req.user.activeRole] || [];

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Your role (${req.user.activeRole}) does not have permission: ${permission}`
        }
      });
    }

    next();
  };
};

/**
 * Middleware to ensure user has completed role selection
 */
const requireRoleSelection = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }

  // Check if user needs to select a role
  if (!req.user.roles || req.user.roles.length === 0) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ROLE_SELECTION_REQUIRED',
        message: 'Please complete role selection to continue',
        requiresRoleSelection: true
      }
    });
  }

  // Check if user has confirmed their role
  if (!req.user.roleConfirmed) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ROLE_CONFIRMATION_REQUIRED',
        message: 'Please confirm your role to continue',
        requiresRoleConfirmation: true
      }
    });
  }

  next();
};

module.exports = {
  requireRole,
  checkPermission,
  requireRoleSelection
};
