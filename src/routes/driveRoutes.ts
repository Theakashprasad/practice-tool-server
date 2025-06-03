import { Router } from 'express';
import { scanAndIngest } from '../controllers/DriveController';

const router = Router();

router.post('/scan', scanAndIngest); // POST /api/scan

export default router;
