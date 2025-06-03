// src/routes/staffRoutes.ts

import express from 'express';
import * as staffController from '../controllers/staffController';

const router = express.Router();

router.get('/', staffController.getStaff);
router.get('/:id', staffController.getStaffById);
router.post('/', staffController.createStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

export default router;
