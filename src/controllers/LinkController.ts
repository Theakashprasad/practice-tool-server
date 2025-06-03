import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/typeorm';
import { Link } from '../models/Link';

const linkRepository = AppDataSource.getRepository(Link);

export class LinkController {
    // Get all links
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const links = await linkRepository.find({ order: { createdAt: 'DESC' } });
            return res.json(links);
        } catch (error) {
            next(error);
        }
    }

    // Get link by ID
    static async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const link = await linkRepository.findOne({ where: { id } });
            if (!link) {
                return res.status(404).json({ message: 'Link not found' });
            }
            return res.json(link);
        } catch (error) {
            next(error);
        }
    }

    // Create new link
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { entity, linkType, url, showToClient } = req.body;
            const link = linkRepository.create({
                entity,
                linkType,
                url,
                showToClient
            });
            const result = await linkRepository.save(link);
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // Update link
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { entity, linkType, url, showToClient } = req.body;
            const link = await linkRepository.findOne({ where: { id } });
            if (!link) {
                return res.status(404).json({ message: 'Link not found' });
            }
            link.entity = entity ?? link.entity;
            link.linkType = linkType ?? link.linkType;
            link.url = url ?? link.url;
            link.showToClient = showToClient ?? link.showToClient;
            const result = await linkRepository.save(link);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // Delete link
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const link = await linkRepository.findOne({ where: { id } });
            if (!link) {
                return res.status(404).json({ message: 'Link not found' });
            }
            await linkRepository.delete(id);
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
} 