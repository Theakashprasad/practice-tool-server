import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/typeorm';
import { Contact } from '../models/Contact';

const contactRepository = AppDataSource.getRepository(Contact);

export class ContactController {
    // Get all contacts
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { clientGroupId, clientEntityId } = req.query;
            
            let queryBuilder = contactRepository.createQueryBuilder('contact');
            
            if (clientGroupId) {
                queryBuilder = queryBuilder.where('contact.clientGroupIds LIKE :clientGroupId', { 
                    clientGroupId: `%${clientGroupId}%` 
                });
            }

            if (clientEntityId) {
                queryBuilder = queryBuilder.where('contact.clientEntityIds LIKE :clientEntityId', { 
                    clientEntityId: `%${clientEntityId}%` 
                });
            }
            
            const contacts = await queryBuilder
                .orderBy('contact.createdAt', 'DESC')
                .getMany();
                
            return res.json(contacts);
        } catch (error) {
            next(error);
        }
    }

    // Get contact by ID
    static async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const contact = await contactRepository.findOne({ where: { id } });
            if (!contact) {
                return res.status(404).json({ message: 'Contact not found' });
            }
            return res.json(contact);
        } catch (error) {
            next(error);
        }
    }

    // Create new contact
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { 
                firstName, 
                lastName, 
                title, 
                emails, 
                phones, 
                dob, 
                permissions, 
                comments,
                clientGroupIds,
                clientEntityIds 
            } = req.body;
            
            const contact = contactRepository.create({
                firstName,
                lastName,
                title,
                emails,
                phones,
                dob,
                permissions,
                comments,
                clientGroupIds: clientGroupIds || null,
                clientEntityIds: clientEntityIds || null
            });
            
            const result = await contactRepository.save(contact);
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // Update contact
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { 
                firstName, 
                lastName, 
                title, 
                emails, 
                phones, 
                dob, 
                permissions, 
                comments,
                clientGroupIds,
                clientEntityIds 
            } = req.body;
            
            const contact = await contactRepository.findOne({ where: { id } });
            if (!contact) {
                return res.status(404).json({ message: 'Contact not found' });
            }

            contact.firstName = firstName ?? contact.firstName;
            contact.lastName = lastName ?? contact.lastName;
            contact.title = title ?? contact.title;
            contact.emails = emails ?? contact.emails;
            contact.phones = phones ?? contact.phones;
            contact.dob = dob ?? contact.dob;
            contact.permissions = permissions ?? contact.permissions;
            contact.comments = comments ?? contact.comments;
            contact.clientGroupIds = clientGroupIds ?? contact.clientGroupIds;
            contact.clientEntityIds = clientEntityIds ?? contact.clientEntityIds;

            const result = await contactRepository.save(contact);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // Delete contact
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const contact = await contactRepository.findOne({ where: { id } });
            if (!contact) {
                return res.status(404).json({ message: 'Contact not found' });
            }
            await contactRepository.delete(id);
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
} 