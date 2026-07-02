const Notification = require('../models/Notification');
const Event = require('../models/Event');

// @desc    Get notifications for current user
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    // Find all completed events to exclude their notifications
    const completedEvents = await Event.find({ status: 'completed' }, '_id');
    const completedLinks = completedEvents.map(e => `/events/${e._id}`);

    const notifications = await Notification.find({
      $or: [{ user: req.user._id }, { isGlobal: true }],
      link: { $nin: completedLinks }
    }).sort({ createdAt: -1 }).limit(50);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark (delete) notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all as read (delete all)
// @route   PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await Notification.deleteMany({
      $or: [{ user: req.user._id }, { isGlobal: true }],
    });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create notification (admin)
// @route   POST /api/notifications
const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification };
