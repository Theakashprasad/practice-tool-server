import { Router, Request, Response } from 'express';
import { ClientGroupController } from '../controllers/clientGroupController';

const router = Router();
const controller = new ClientGroupController();

// Create a new client group
router.post('/', async (req: Request, res: Response) => {
    await controller.create(req, res);
});

// Get all client groups with optional practice filter
router.get('/', async (req: Request, res: Response) => {
    await controller.findAll(req, res);
});

// Get client group by ID
router.get('/:id', async (req: Request, res: Response) => {
    await controller.findById(req, res);
});

// Get client groups by practice ID
router.get('/practice/:practiceId', async (req: Request, res: Response) => {
    await controller.findByPracticeId(req, res);
});

// Update client group
router.put('/:id', async (req: Request, res: Response) => {
    await controller.update(req, res);
});

// Delete client group
router.delete('/:id', async (req: Request, res: Response) => {
    await controller.delete(req, res);
});

export default router; 