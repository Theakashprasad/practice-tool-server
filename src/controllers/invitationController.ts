import { Request, Response } from 'express';
import { client } from '../config/db';
import crypto from 'crypto';

export const getInvitations = async (_req: Request, res: Response) => {
    const result = await client.query('SELECT * FROM invitations ORDER BY id');
    res.json(result.rows);
};

export const getInvitationById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await client.query('SELECT * FROM invitations WHERE id = $1', [id]);
    res.json(result.rows[0]);
};

export const createInvitation = async (req: Request, res: Response) => {
    const { email, level } = req.body;
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    try {
        // Save invitation to database
        const result = await client.query(
            'INSERT INTO invitations (email, token, level, status, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, token, level, 'pending', expiresAt]
        );

        // Generate registration URL
        const registrationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/boxed-signup?token=${token}`;

        res.status(201).json({
            message: 'Invitation created successfully',
            invitation: result.rows[0],
            registrationUrl
        });
    } catch (error) {
        console.error('Error creating invitation:', error);
        res.status(500).json({ error: 'Failed to create invitation' });
    }
};

export const updateInvitation = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, level, status } = req.body;
    
    try {
        const result = await client.query(
            `UPDATE invitations SET
             email = $1,
             level = $2,
             status = $3,
             updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 RETURNING *`,
            [email, level, status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invitation not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating invitation:', error);
        res.status(500).json({ error: 'Failed to update invitation' });
    }
};

export const deleteInvitation = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await client.query('DELETE FROM invitations WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting invitation:', error);
        res.status(500).json({ error: 'Failed to delete invitation' });
    }
};

export const validateInvitationToken = async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ 
            valid: false, 
            message: 'Token is required' 
        });
    }

    try {
        const result = await client.query(
            'SELECT * FROM invitations WHERE token = $1',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                valid: false, 
                message: 'Invalid invitation token' 
            });
        }

        const invitation = result.rows[0];

        // Check if invitation is expired
        if (invitation.status === 'expired') {
            return res.status(400).json({ 
                valid: false, 
                message: 'This invitation has been withdrawn and is no longer valid' 
            });
        }

        // Check if invitation has expired based on expires_at
        if (new Date(invitation.expires_at) < new Date()) {
            return res.status(400).json({ 
                valid: false, 
                message: 'This invitation has expired' 
            });
        }

        res.json({ 
            valid: true, 
            message: 'Token is valid',
            invitation: {
                email: invitation.email,
                level: invitation.level
            }
        });
    } catch (error) {
        console.error('Error validating token:', error);
        res.status(500).json({ 
            valid: false, 
            message: 'Error validating token' 
        });
    }
};

export const withdrawInvitation = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await client.query(
            `UPDATE invitations SET
             status = 'expired',
             updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 RETURNING *`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invitation not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error withdrawing invitation:', error);
        res.status(500).json({ error: 'Failed to withdraw invitation' });
    }
};
