import express, { Router } from 'express';
import { ServiceSubscribedController } from '../controllers/ServiceSubscribedController';

const router: Router = express.Router();

// Get all services subscribed
router.get('/', async (req, res, next) => {
    await ServiceSubscribedController.getAll(req, res, next);
});

// Get service subscribed by ID
router.get('/:id', async (req, res, next) => {
    await ServiceSubscribedController.getOne(req, res, next);
});

// Create new service subscribed
router.post('/', async (req, res, next) => {
    await ServiceSubscribedController.create(req, res, next);
});

// Update service subscribed
router.put('/:id', async (req, res, next) => {
    await ServiceSubscribedController.update(req, res, next);
});

// Delete service subscribed
router.delete('/:id', async (req, res, next) => {
    await ServiceSubscribedController.delete(req, res, next);
});

export default router; 