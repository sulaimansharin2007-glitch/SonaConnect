const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { extractPosterData } = require('../controllers/aiController');

// Only protected users can use this (Faculty, Admins)
router.post('/extract-poster', protect, extractPosterData);

module.exports = router;
