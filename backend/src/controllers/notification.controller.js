const notificationService = require('../services/notifications/notification.service');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.id);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await notificationService.markAsRead(req.user.id, req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.triggerManual = async (req, res) => {
  try {
    await notificationService.triggerAllNotifiers();
    res.status(200).json({ success: true, message: 'Notifications triggered.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
