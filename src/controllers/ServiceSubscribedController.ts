import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/typeorm';
import { ServiceSubscribed } from '../models/ServiceSubscribed';
import { ServiceType } from '../models/ServiceType';

const serviceSubscribedRepository = AppDataSource.getRepository(ServiceSubscribed);
const serviceTypeRepository = AppDataSource.getRepository(ServiceType);

export class ServiceSubscribedController {
    // Get all services subscribed
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const services = await serviceSubscribedRepository.find({
                relations: ['type'],
                order: { createdAt: 'DESC' }
            });
            return res.json(services);
        } catch (error) {
            next(error);
        }
    }

    // Get service subscribed by ID
    static async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = await serviceSubscribedRepository.findOne({ where: { id }, relations: ['type'] });
            if (!service) {
                return res.status(404).json({ message: 'Service subscribed not found' });
            }
            return res.json(service);
        } catch (error) {
            next(error);
        }
    }

    // Create new service subscribed
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { typeId, frequency, reportingDate, dueDate, nonBillable, packageBilled, mrr, serviceStartDate, serviceEndDate } = req.body;
            const type = await serviceTypeRepository.findOne({ where: { id: typeId } });
            if (!type) {
                return res.status(400).json({ message: 'Invalid service type' });
            }
            const service = serviceSubscribedRepository.create({
                type,
                frequency,
                reportingDate,
                dueDate,
                nonBillable,
                packageBilled,
                mrr,
                serviceStartDate,
                serviceEndDate
            });
            const result = await serviceSubscribedRepository.save(service);
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // Update service subscribed
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { typeId, frequency, reportingDate, dueDate, nonBillable, packageBilled, mrr, serviceStartDate, serviceEndDate } = req.body;
            const service = await serviceSubscribedRepository.findOne({ where: { id }, relations: ['type'] });
            if (!service) {
                return res.status(404).json({ message: 'Service subscribed not found' });
            }
            if (typeId) {
                const type = await serviceTypeRepository.findOne({ where: { id: typeId } });
                if (!type) {
                    return res.status(400).json({ message: 'Invalid service type' });
                }
                service.type = type;
            }
            service.frequency = frequency ?? service.frequency;
            service.reportingDate = reportingDate ?? service.reportingDate;
            service.dueDate = dueDate ?? service.dueDate;
            service.nonBillable = nonBillable ?? service.nonBillable;
            service.packageBilled = packageBilled ?? service.packageBilled;
            service.mrr = mrr ?? service.mrr;
            service.serviceStartDate = serviceStartDate ?? service.serviceStartDate;
            service.serviceEndDate = serviceEndDate ?? service.serviceEndDate;
            const result = await serviceSubscribedRepository.save(service);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // Delete service subscribed
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = await serviceSubscribedRepository.findOne({ where: { id } });
            if (!service) {
                return res.status(404).json({ message: 'Service subscribed not found' });
            }
            await serviceSubscribedRepository.delete(id);
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
} 