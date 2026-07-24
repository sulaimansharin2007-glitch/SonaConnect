const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAllUsers, deleteOwnAccount, deleteUser, updateUserRole } = require('../controllers/userController');

router.get('/', protect, getAllUsers);
router.delete('/me', protect, deleteOwnAccount);
router.delete('/:id', protect, deleteUser);
router.put('/:id/role', protect, updateUserRole);

module.exports = router;
