import { Router, Request, Response } from 'express';
import { PracticeController } from '../controllers/practiceController';

const router = Router();
const controller = new PracticeController();

// Create a new practice
router.post('/', async (req: Request, res: Response) => {
    await controller.create(req, res);
});

// Get all practices
router.get('/', async (req: Request, res: Response) => {
    await controller.findAll(req, res);
});

// Get practice by ID
router.get('/:id', async (req: Request, res: Response) => {
    await controller.findById(req, res);
});

// Update practice
router.put('/:id', async (req: Request, res: Response) => {
    await controller.update(req, res);
});

// Delete practice
router.delete('/:id', async (req: Request, res: Response) => {
    await controller.delete(req, res);
});

export default router; 