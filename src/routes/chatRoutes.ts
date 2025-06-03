import express from 'express';
import * as chatController from '../controllers/chatController';

const router = express.Router();

router.get('/models', chatController.getAvailableModels);
router.post('/', chatController.chat);
router.get('/preferences/:userId', chatController.getUserPreferences);
router.get('/history/:userId', chatController.getUserChatHistory);
router.get('/session/:sessionId', chatController.getChatSession);
router.post('/preferences', chatController.updateUserPreferences);
router.post('/cleanup', chatController.cleanupExpiredSessions);

export default router; 