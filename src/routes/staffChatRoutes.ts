import express from 'express';
import * as chatController from '../controllers/staffchatController';

const router = express.Router();


// New routes for chat rooms
router.get('/rooms', chatController.getChatRooms);
router.get('/rooms/:roomId/messages', chatController.getRoomMessages);

export default router; 