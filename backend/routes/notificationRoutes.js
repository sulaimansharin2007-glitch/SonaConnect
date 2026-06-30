const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, createNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.post('/', protect, authorizeRoles('super_admin'), createNotification);

module.exports = router;
