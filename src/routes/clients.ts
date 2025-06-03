import express, { Router, Request, Response, NextFunction } from 'express';
import { ClientController } from '../controllers/ClientController';

const router: Router = express.Router();

// Get clients by client group - this needs to be before /:id to avoid path conflicts
router.get('/group/:clientGroupId', async function(req: Request, res: Response, next: NextFunction) {
    await ClientController.getByClientGroup(req, res, next);
});

// Create a new client
router.post('/', async function(req: Request, res: Response, next: NextFunction) {
    await ClientController.create(req, res, next);
});

// Get all clients with optional filters
router.get('/', async function(req: Request, res: Response, next: NextFunction) {
    await ClientController.getAll(req, res, next);
});

// Get client by ID
router.get('/:id', async function(req: Request, res: Response, next: NextFunction) {
    await ClientController.getOne(req, res, next);
});

// Update client
router.put('/:id', async function(req: Request, res: Response, next: NextFunction) {
    await ClientController.update(req, res, next);
});

// Delete client
router.delete('/:id', async function(req: Request, res: Response, next: NextFunction) {
    await ClientController.delete(req, res, next);
});

export default router; 