const Notification = require('../models/Notification');

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });

    const formatted = notifications.map((n) => ({
      _id: n._id,
      title: n.title || 'Notification',
      body: n.body || n.message || '',
      type: n.type || 'system',
      read: n.read,
      relatedItem: n.relatedItem || null,
      createdAt: n.createdAt,
    }));

    return res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    return res.json({ success: true, ok: true, notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });

    return res.json({ success: true, ok: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
