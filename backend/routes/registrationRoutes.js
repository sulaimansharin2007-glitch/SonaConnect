const express = require('express');
const router = express.Router();
const { registerForEvent, getMyEvents, getEventRegistrations, cancelRegistration } = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', protect, authorizeRoles('student'), registerForEvent);
router.get('/my-events', protect, getMyEvents);
router.get('/event/:eventId', protect, authorizeRoles('super_admin', 'club_admin', 'faculty'), getEventRegistrations);
router.delete('/:id', protect, cancelRegistration);

module.exports = router;
