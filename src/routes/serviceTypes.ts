import express, { Router } from 'express';
import { ServiceTypeController } from '../controllers/ServiceTypeController';

const router: Router = express.Router();

// Get all service types
router.get('/', async (req, res, next) => {
    await ServiceTypeController.getAll(req, res, next);
});

// Get service type by ID
router.get('/:id', async (req, res, next) => {
    await ServiceTypeController.getOne(req, res, next);
});

// Create new service type
router.post('/', async (req, res, next) => {
    await ServiceTypeController.create(req, res, next);
});

// Update service type
router.put('/:id', async (req, res, next) => {
    await ServiceTypeController.update(req, res, next);
});

// Delete service type
router.delete('/:id', async (req, res, next) => {
    await ServiceTypeController.delete(req, res, next);
});

export default router; 