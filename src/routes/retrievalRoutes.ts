import { Router, Request, Response } from 'express';
import { ragRetrieval } from '../controllers/RagController'

const router = Router();

router.post('/search', ragRetrieval)

export default router;