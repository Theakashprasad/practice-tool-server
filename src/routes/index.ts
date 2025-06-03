import { Router } from 'express';
import userRoutes from './userRoutes';
import chatRoutes from './chatRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/chat', chatRoutes);

export default router;
