const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { extractPosterData, chatEvent } = require('../controllers/aiController');

// Only protected users can use this (Faculty, Admins)
router.post('/extract-poster', protect, extractPosterData);

// AI Chatbot — anyone on the website can chat about events (no login required)
router.post('/chat', chatEvent);

module.exports = router;
