const express = require('express');
const router = express.Router();
const { getClubs, getClubById, createClub, updateClub, deleteClub, joinClub, addAnnouncement, getMyManagedClubs } = require('../controllers/clubController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/my-managed-clubs', protect, authorizeRoles('faculty', 'super_admin'), getMyManagedClubs);
router.get('/', getClubs);
router.get('/:id', getClubById);
router.post('/', protect, authorizeRoles('super_admin'), createClub);
router.put('/:id', protect, authorizeRoles('super_admin', 'club_admin'), updateClub);
router.delete('/:id', protect, authorizeRoles('super_admin'), deleteClub);
router.post('/:id/join', protect, authorizeRoles('student'), joinClub);
router.post('/:id/announcements', protect, authorizeRoles('super_admin', 'club_admin'), addAnnouncement);

module.exports = router;
