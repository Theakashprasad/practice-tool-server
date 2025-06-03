import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/typeorm';
import { ServiceType } from '../models/ServiceType';

const serviceTypeRepository = AppDataSource.getRepository(ServiceType);

export class ServiceTypeController {
    // Get all service types
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const serviceTypes = await serviceTypeRepository.find({
                order: { name: 'ASC' }
            });
            return res.json(serviceTypes);
        } catch (error) {
            next(error);
        }
    }

    // Get service type by ID
    static async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const serviceType = await serviceTypeRepository.findOne({ where: { id } });
            if (!serviceType) {
                return res.status(404).json({ message: 'Service type not found' });
            }
            return res.json(serviceType);
        } catch (error) {
            next(error);
        }
    }

    // Create new service type
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, comments } = req.body;
            // Check for duplicate name
            const existing = await serviceTypeRepository.findOne({ where: { name } });
            if (existing) {
                return res.status(400).json({ message: 'Service type with this name already exists' });
            }
            const serviceType = serviceTypeRepository.create({ name, comments });
            const result = await serviceTypeRepository.save(serviceType);
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // Update service type
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, comments } = req.body;
            const serviceType = await serviceTypeRepository.findOne({ where: { id } });
            if (!serviceType) {
                return res.status(404).json({ message: 'Service type not found' });
            }
            // Check for duplicate name if name is changing
            if (name && name !== serviceType.name) {
                const existing = await serviceTypeRepository.findOne({ where: { name } });
                if (existing) {
                    return res.status(400).json({ message: 'Service type with this name already exists' });
                }
            }
            serviceType.name = name ?? serviceType.name;
            serviceType.comments = comments ?? serviceType.comments;
            const result = await serviceTypeRepository.save(serviceType);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // Delete service type
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const serviceType = await serviceTypeRepository.findOne({ where: { id } });
            if (!serviceType) {
                return res.status(404).json({ message: 'Service type not found' });
            }
            await serviceTypeRepository.delete(id);
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
} 