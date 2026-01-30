// Quick script to clear old notifications without applicationId
// Run this in MongoDB shell or via API endpoint

const mongoose = require('mongoose');
const Notification = require('./models/Notification');

async function clearOldNotifications() {
  try {
    await mongoose.connect('mongodb://localhost:27017/openguild');
    
    // Delete notifications of type application_received without applicationId
    const result = await Notification.deleteMany({
      type: 'application_received',
      applicationId: { $exists: false }
    });
    
    console.log(`Deleted ${result.deletedCount} old notifications`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run:
// clearOldNotifications();

module.exports = clearOldNotifications;
