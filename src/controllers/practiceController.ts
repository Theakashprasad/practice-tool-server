import { Request, Response } from 'express';
import { PracticeService } from '../services/practiceService';

export class PracticeController {
    private practiceService = new PracticeService();

    // Create a new practice
    async create(req: Request, res: Response) {
        try {
            const practice = await this.practiceService.create(req.body);
            res.status(201).json(practice);
        } catch (error) {
            res.status(400).json({ message: 'Error creating practice', error });
        }
    }

    // Get all practices
    async findAll(req: Request, res: Response) {
        try {
            const practices = req.query.withStaff === 'true' 
                ? await this.practiceService.findAllWithStaff()
                : await this.practiceService.findAll();
            res.json(practices);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching practices', error });
        }
    }

    // Get practice by ID
    async findById(req: Request, res: Response) {
        try {
            const practice = req.query.withStaff === 'true'
                ? await this.practiceService.findByIdWithStaff(req.params.id)
                : await this.practiceService.findById(req.params.id);
                
            if (!practice) {
                return res.status(404).json({ message: 'Practice not found' });
            }
            res.json(practice);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching practice', error });
        }
    }

    // Update practice
    async update(req: Request, res: Response) {
        try {
            const practice = await this.practiceService.update(req.params.id, req.body);
            if (!practice) {
                return res.status(404).json({ message: 'Practice not found' });
            }
            res.json(practice);
        } catch (error) {
            res.status(400).json({ message: 'Error updating practice', error });
        }
    }

    // Delete practice
    async delete(req: Request, res: Response) {
        try {
            const deleted = await this.practiceService.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ message: 'Practice not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting practice', error });
        }
    }
} 