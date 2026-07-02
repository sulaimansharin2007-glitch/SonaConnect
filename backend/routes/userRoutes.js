const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAllUsers, deleteUser, updateUserRole } = require('../controllers/userController');

router.get('/', protect, getAllUsers);
router.delete('/:id', protect, deleteUser);
router.put('/:id/role', protect, updateUserRole);

module.exports = router;
