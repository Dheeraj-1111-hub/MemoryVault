const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// POST /api/chat/ask
router.post('/ask', chatController.askQuestion);

// GET /api/chat/:threadId
router.get('/:threadId', chatController.getThreadHistory);

module.exports = router;
