import { Router } from 'express';
import { ToolController } from '../controllers/toolController';

const router = Router();
const toolController = new ToolController();

router.post('/', toolController.create);
router.get('/', toolController.getAll);
router.get('/:id', toolController.getOne);
router.put('/:id', toolController.update);
router.delete('/:id', toolController.delete);

export default router;
