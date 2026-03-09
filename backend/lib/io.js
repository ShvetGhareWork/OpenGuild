// Singleton that holds the Socket.io server instance.
// Set by server.js at startup; imported by routes that need to emit events.
let _io = null;

module.exports = {
  setIo: (io) => { _io = io; },
  getIo: () => _io,

  // Helpers ─────────────────────────────────────────────────

  /** Emit a notification to a specific user's room */
  emitNotification: (userId, notification) => {
    if (_io) _io.to(`user:${userId}`).emit('notification', notification);
  },

  /** Broadcast updated upvote count to all viewers of /projects */
  emitUpvote: (projectId, upvotes) => {
    if (_io) _io.emit('project:upvoted', { projectId, upvotes });
  },

  /** Broadcast milestone update to everyone in the project room */
  emitMilestone: (projectId, milestone) => {
    if (_io) _io.to(`project-${projectId}`).emit('milestone:updated', { projectId, milestone });
  },
};
