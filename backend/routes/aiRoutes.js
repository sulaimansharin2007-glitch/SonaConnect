const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { extractPosterData, chatEvent } = require('../controllers/aiController');

// Only protected users can use this (Faculty, Admins)
router.post('/extract-poster', protect, extractPosterData);

// AI Chatbot — any logged-in user can chat about events
router.post('/chat', protect, chatEvent);

module.exports = router;
