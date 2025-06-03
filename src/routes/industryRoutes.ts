import { Router, Request, Response, NextFunction } from 'express';
import { IndustryController } from '../controllers/IndustryController';

const router = Router();

// Create a new industry
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    await IndustryController.create(req, res, next);
});

// Get all industries
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    await IndustryController.getAll(req, res, next);
});

// Get industry by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    await IndustryController.getOne(req, res, next);
});

// Update industry
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    await IndustryController.update(req, res, next);
});

// Delete industry
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    await IndustryController.delete(req, res, next);
});

export default router; 