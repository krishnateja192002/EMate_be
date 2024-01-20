const express = require('express');
const router = express.Router();
const textChatController = require('../controllers/textChat');

// Define your routes
router.get('/start_chat', textChatController.getTextUsers);
router.post('/start_chat', textChatController.startChat);

module.exports = router;