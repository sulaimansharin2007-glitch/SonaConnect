const express = require('express');
const { verifyWebhook, handleWebhook } = require('../controllers/whatsappController');

const router = express.Router();

// GET /api/whatsapp/webhook - for Meta verification
router.get('/webhook', verifyWebhook);

// POST /api/whatsapp/webhook - for receiving messages
router.post('/webhook', handleWebhook);

module.exports = router;
