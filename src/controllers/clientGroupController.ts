import { Request, Response } from 'express';
import { ClientGroupService } from '../services/clientGroupService';

export class ClientGroupController {
    private clientGroupService = new ClientGroupService();

    // Create a new client group
    async create(req: Request, res: Response) {
        try {
            const clientGroup = await this.clientGroupService.create(req.body);
            res.status(201).json(clientGroup);
        } catch (error) {
            res.status(400).json({ 
                message: 'Error creating client group', 
                error: error instanceof Error ? error.message : error 
            });
        }
    }

    // Get all client groups, optionally filtered by practice
    async findAll(req: Request, res: Response) {
        try {
            const practiceId = req.query.practiceId as string | undefined;
            const clientGroups = await this.clientGroupService.findAll(practiceId);
            res.json(clientGroups);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching client groups',
                error: error instanceof Error ? error.message : error 
            });
        }
    }

    // Get client group by ID
    async findById(req: Request, res: Response) {
        try {
            const clientGroup = await this.clientGroupService.findById(req.params.id);
            if (!clientGroup) {
                return res.status(404).json({ message: 'Client group not found' });
            }
            res.json(clientGroup);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching client group',
                error: error instanceof Error ? error.message : error 
            });
        }
    }

    // Get client groups by practice ID
    async findByPracticeId(req: Request, res: Response) {
        try {
            const clientGroups = await this.clientGroupService.findByPracticeId(req.params.practiceId);
            res.json(clientGroups);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching client groups for practice',
                error: error instanceof Error ? error.message : error 
            });
        }
    }

    // Update client group
    async update(req: Request, res: Response) {
        try {
            const clientGroup = await this.clientGroupService.update(req.params.id, req.body);
            if (!clientGroup) {
                return res.status(404).json({ message: 'Client group not found' });
            }
            res.json(clientGroup);
        } catch (error) {
            res.status(400).json({ 
                message: 'Error updating client group',
                error: error instanceof Error ? error.message : error 
            });
        }
    }

    // Delete client group
    async delete(req: Request, res: Response) {
        try {
            const deleted = await this.clientGroupService.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ message: 'Client group not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ 
                message: 'Error deleting client group',
                error: error instanceof Error ? error.message : error 
            });
        }
    }
} 