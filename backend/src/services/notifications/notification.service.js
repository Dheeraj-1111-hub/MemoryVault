const Notification = require('../../models/Notification');
const { checkDeadlines } = require('./deadlineNotifier');
const { checkResumeHealth } = require('./resumeNotifier');
const { checkMissingDocs } = require('./missingDocsNotifier');
const { checkWeeklyDigest } = require('./weeklyDigestNotifier');

exports.getNotifications = async (userId) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
};

exports.markAsRead = async (userId, id) => {
  return await Notification.findOneAndUpdate({ _id: id, userId }, { isRead: true });
};

exports.markAllAsRead = async (userId) => {
  return await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

exports.triggerAllNotifiers = async () => {
  console.log('[Notifier] Running all notification checks...');
  const User = require('../../models/User');
  const users = await User.find().select('_id').lean();
  
  for (const user of users) {
    try {
      await Promise.all([
        checkDeadlines(user._id),
        checkResumeHealth(user._id),
        checkMissingDocs(user._id),
        checkWeeklyDigest(user._id)
      ]);
    } catch (e) {
      console.error(`[Notifier] Error for user ${user._id}:`, e);
    }
  }
  
  console.log('[Notifier] Notification checks complete.');
};
