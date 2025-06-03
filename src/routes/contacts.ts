import express, { Router } from 'express';
import { ContactController } from '../controllers/ContactController';

const router: Router = express.Router();

// Get all contacts
router.get('/', async (req, res, next) => {
    await ContactController.getAll(req, res, next);
});

// Get contact by ID
router.get('/:id', async (req, res, next) => {
    await ContactController.getOne(req, res, next);
});

// Create new contact
router.post('/', async (req, res, next) => {
    await ContactController.create(req, res, next);
});

// Update contact
router.put('/:id', async (req, res, next) => {
    await ContactController.update(req, res, next);
});

// Delete contact
router.delete('/:id', async (req, res, next) => {
    await ContactController.delete(req, res, next);
});

export default router; 