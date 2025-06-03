import express, { Router } from 'express';
import { LinkController } from '../controllers/LinkController';

const router: Router = express.Router();

// Get all links
router.get('/', async (req, res, next) => {
    await LinkController.getAll(req, res, next);
});

// Get link by ID
router.get('/:id', async (req, res, next) => {
    await LinkController.getOne(req, res, next);
});

// Create new link
router.post('/', async (req, res, next) => {
    await LinkController.create(req, res, next);
});

// Update link
router.put('/:id', async (req, res, next) => {
    await LinkController.update(req, res, next);
});

// Delete link
router.delete('/:id', async (req, res, next) => {
    await LinkController.delete(req, res, next);
});

export default router; 