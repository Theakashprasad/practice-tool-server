import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/typeorm';
import { Client } from '../models/Client';
import { ClientGroup } from '../models/ClientGroup';
import { ServiceType } from '../models/ServiceType';
import { ServiceSubscribed, ServiceFrequency } from '../models/ServiceSubscribed';
import { Industry } from '../models/Industry';
import crypto from 'crypto';

const clientRepository = AppDataSource.getRepository(Client);
const serviceTypeRepository = AppDataSource.getRepository(ServiceType);
const serviceSubscribedRepository = AppDataSource.getRepository(ServiceSubscribed);
const industryRepository = AppDataSource.getRepository(Industry);

export class ClientController {
    // Create a new client
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { serviceTypes, industryId, ...clientData } = req.body;

            // Validate client group exists
            const clientGroup = await AppDataSource.getRepository(ClientGroup).findOne({
                where: { id: clientData.clientGroupId }
            });

            if (!clientGroup) {
                return res.status(400).json({ message: 'Client group not found' });
            }

            // Validate industry exists if provided
            if (industryId) {
                const industry = await industryRepository.findOne({
                    where: { id: industryId }
                });

                if (!industry) {
                    return res.status(400).json({ message: 'Industry not found' });
                }
            }

            // Validate tax IDs if provided
            if (clientData.taxIds && Array.isArray(clientData.taxIds)) {
                clientData.taxIds = clientData.taxIds.map((taxId: any) => ({
                    ...taxId,
                    id: taxId.id || crypto.randomUUID()
                }));
            }

            // Create new client instance
            const client = clientRepository.create({
                ...clientData,
                industryId
            });

            // Insert the client
            const result = await clientRepository.insert(client);
            const clientId = result.identifiers[0].id;

            // If service types are provided, create service subscriptions
            if (serviceTypes && Array.isArray(serviceTypes)) {
                for (const serviceTypeId of serviceTypes) {
                    const serviceType = await serviceTypeRepository.findOne({
                        where: { id: serviceTypeId }
                    });

                    if (serviceType) {
                        const serviceSubscribed = serviceSubscribedRepository.create({
                            clientId: clientId,
                            type: serviceType,
                            frequency: ServiceFrequency.MONTHLY, // Default frequency
                            serviceStartDate: new Date(),
                            nonBillable: false,
                            packageBilled: false
                        });
                        await serviceSubscribedRepository.save(serviceSubscribed);
                    }
                }
            }

            // Fetch the client with relations
            const clientWithRelations = await clientRepository.findOne({
                where: { id: clientId },
                relations: ['clientGroup', 'subscribedServices', 'subscribedServices.type', 'industry']
            });

            return res.status(201).json(clientWithRelations);
        } catch (error) {
            next(error);
        }
    }

    // Get all clients with optional filters
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                clientGroupId,
                status,
                structure,
                industryId,
                accountingSystem
            } = req.query;

            // Build query with filters
            const queryBuilder = clientRepository.createQueryBuilder('client')
                .leftJoinAndSelect('client.clientGroup', 'clientGroup')
                .leftJoinAndSelect('client.subscribedServices', 'subscribedServices')
                .leftJoinAndSelect('subscribedServices.type', 'serviceType')
                .leftJoinAndSelect('client.industry', 'industry');

            if (clientGroupId) {
                queryBuilder.andWhere('client.clientGroupId = :clientGroupId', { clientGroupId });
            }
            if (status) {
                queryBuilder.andWhere('client.status = :status', { status });
            }
            if (structure) {
                queryBuilder.andWhere('client.structure = :structure', { structure });
            }
            if (industryId) {
                queryBuilder.andWhere('client.industryId = :industryId', { industryId });
            }
            if (accountingSystem) {
                queryBuilder.andWhere('client.accountingSystem = :accountingSystem', { accountingSystem });
            }

            const clients = await queryBuilder.getMany();
            console.log(clients);
            
            return res.json(clients);
        } catch (error) {
            next(error);
        }
    }

    // Get client by ID
    static async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const client = await clientRepository.findOne({
                where: { id },
                relations: ['clientGroup', 'subscribedServices', 'subscribedServices.type', 'industry']
            });
            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }

            return res.json(client);
        } catch (error) {
            next(error);
        }
    }

    // Update client
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { serviceTypes, industryId, subscribedServices, ...updateData } = req.body;

            // Check if client exists
            const client = await clientRepository.findOne({ where: { id } });
            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }

            // If client group is being updated, validate it exists
            if (updateData.clientGroupId) {
                const clientGroup = await AppDataSource.getRepository(ClientGroup).findOne({
                    where: { id: updateData.clientGroupId }
                });
                if (!clientGroup) {
                    return res.status(400).json({ message: 'Client group not found' });
                }
            }

            // If industry is being updated, validate it exists
            if (industryId) {
                const industry = await industryRepository.findOne({
                    where: { id: industryId }
                });
                if (!industry) {
                    return res.status(400).json({ message: 'Industry not found' });
                }
            }

            // Validate tax IDs if provided
            if (updateData.taxIds && Array.isArray(updateData.taxIds)) {
                updateData.taxIds = updateData.taxIds.map((taxId: any) => ({
                    ...taxId,
                    id: taxId.id || crypto.randomUUID()
                }));
            }

            // Update client without service types
            await clientRepository.update(id, {
                ...updateData,
                industryId
            });

            // Handle service types update if provided
            if (serviceTypes && Array.isArray(serviceTypes)) {
                // Remove existing service subscriptions
                await serviceSubscribedRepository.delete({ clientId: id });

                // Create new service subscriptions
                for (const serviceTypeId of serviceTypes) {
                    const serviceType = await serviceTypeRepository.findOne({
                        where: { id: serviceTypeId }
                    });

                    if (serviceType) {
                        const serviceSubscribed = serviceSubscribedRepository.create({
                            clientId: id,
                            type: serviceType,
                            frequency: ServiceFrequency.MONTHLY, // Default frequency
                            serviceStartDate: new Date(),
                            nonBillable: false,
                            packageBilled: false
                        });
                        await serviceSubscribedRepository.save(serviceSubscribed);
                    }
                }
            }
            
            // Fetch and return updated client with relations
            const updatedClient = await clientRepository.findOne({
                where: { id },
                relations: ['clientGroup', 'subscribedServices', 'subscribedServices.type', 'industry']
            });
            
            return res.json(updatedClient);
        } catch (error) {
            next(error);
        }
    }

    // Delete client
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            
            // Check if client exists
            const client = await clientRepository.findOne({ where: { id } });
            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }

            // Delete client
            await clientRepository.delete(id);
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    // Get clients by client group
    static async getByClientGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const { clientGroupId } = req.params;
            
            const clients = await clientRepository.find({
                where: { clientGroupId },
                relations: ['clientGroup']
            });

            console.log("clients by group",clients);
            

            return res.json(clients);
        } catch (error) {
            next(error);
        }
    }
} 