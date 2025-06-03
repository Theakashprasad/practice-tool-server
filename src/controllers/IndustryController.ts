import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/typeorm';
import { Industry } from '../models/Industry';
import { Practice } from '../models/Practice';



const industryRepository = AppDataSource.getRepository(Industry);

export class IndustryController {
    // Create a new industry
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, description } = req.body;

            // Check if industry with same name already exists
            const existingIndustry = await industryRepository.findOne({
                where: { name }
            });

            if (existingIndustry) {
                return res.status(400).json({ message: 'Industry with this name already exists' });
            }

            const industry = industryRepository.create({ name, description });
            const savedIndustry = await industryRepository.save(industry);

            return res.status(201).json(savedIndustry);
        } catch (error) {
            next(error);
        }
    }

    // Get all industries
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const industries = await industryRepository.find({
                order: {
                    name: 'ASC'
                }
            });
            return res.json(industries);
        } catch (error) {
            next(error);
        }
    }

    // Get industry by ID
    static async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const industry = await industryRepository.findOne({
                where: { id }
            });

            if (!industry) {
                return res.status(404).json({ message: 'Industry not found' });
            }

            return res.json(industry);
        } catch (error) {
            next(error);
        }
    }

    // Update industry
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            // Check if industry exists
            const industry = await industryRepository.findOne({
                where: { id }
            });

            if (!industry) {
                return res.status(404).json({ message: 'Industry not found' });
            }

            // Check if new name is already taken
            if (name !== industry.name) {
                const existingIndustry = await industryRepository.findOne({
                    where: { name }
                });

                if (existingIndustry) {
                    return res.status(400).json({ message: 'Industry with this name already exists' });
                }
            }

            industry.name = name;
            industry.description = description;
            const updatedIndustry = await industryRepository.save(industry);

            return res.json(updatedIndustry);
        } catch (error) {
            next(error);
        }
    }

    // Delete industry
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            // Check if industry exists
            const industry = await industryRepository.findOne({
                where: { id }
            });

            if (!industry) {
                return res.status(404).json({ message: 'Industry not found' });
            }

            await industryRepository.remove(industry);
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
} 