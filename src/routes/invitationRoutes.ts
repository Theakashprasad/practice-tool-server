import { Router } from 'express';
import type { RequestHandler } from 'express';
import {
    getInvitations,
    getInvitationById,
    createInvitation,
    updateInvitation,
    deleteInvitation,
    validateInvitationToken,
    withdrawInvitation
} from '../controllers/invitationController';

const router = Router();

router.get('/', getInvitations as RequestHandler);
router.get('/:id', getInvitationById as RequestHandler);
router.post('/', createInvitation as RequestHandler);
router.put('/:id', updateInvitation as RequestHandler);
router.delete('/:id', deleteInvitation as RequestHandler);
router.get('/validate/token', validateInvitationToken as RequestHandler);
router.post('/:id/withdraw', withdrawInvitation as RequestHandler);

export default router;
