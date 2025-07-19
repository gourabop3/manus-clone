const express = require('express');
const {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  sendStreamingMessage,
  updateConversation,
  deleteConversation,
  clearConversation,
  getAvailableModels
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Models route
router.get('/models', getAvailableModels);

// Conversation routes
router.route('/conversations')
  .get(getConversations)
  .post(createConversation);

router.route('/conversations/:id')
  .get(getConversation)
  .put(updateConversation)
  .delete(deleteConversation);

router.post('/conversations/:id/messages', sendMessage);
router.post('/conversations/:id/stream', sendStreamingMessage);
router.post('/conversations/:id/clear', clearConversation);

module.exports = router;

