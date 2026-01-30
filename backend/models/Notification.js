const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['application_received', 'application_accepted', 'application_rejected'],
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  projectName: String,
  applicationId: String, // ID of the application in the project's applications array
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  applicantName: String,
  roleName: String,
  message: String,
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
