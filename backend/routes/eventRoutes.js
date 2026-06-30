const express = require('express');
const router = express.Router();
const { getEvents, getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, approveEvent, getStats } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/stats', getStats);
router.get('/all', protect, authorizeRoles('super_admin'), getAllEvents);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', protect, authorizeRoles('super_admin', 'club_admin', 'faculty'), createEvent);
router.put('/:id/approve', protect, authorizeRoles('super_admin'), approveEvent);
router.put('/:id', protect, authorizeRoles('super_admin', 'club_admin', 'faculty'), updateEvent);
router.delete('/:id', protect, authorizeRoles('super_admin', 'club_admin', 'faculty'), deleteEvent);

module.exports = router;
