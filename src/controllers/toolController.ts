import { Request, Response } from 'express';
import { AppDataSource } from '../config/typeorm';
import { Tool, ToolStatus } from '../models/Tool';
import { Practice } from '../models/Practice';
import { Client } from '../models/Client';
import { In } from 'typeorm';

const toolRepository = AppDataSource.getRepository(Tool);
const practiceRepository = AppDataSource.getRepository(Practice);
const clientRepository = AppDataSource.getRepository(Client);

export class ToolController {
    // Create a new tool
    create = async (req: Request, res: Response) => {
        try {
            const { name, category, executionUrl, startingPrompt, sessionMemory, status, practiceIds, clientIds } = req.body;
            
            // Create the tool
            const tool = toolRepository.create({
                name,
                category,
                executionUrl,
                startingPrompt,
                sessionMemory,
                status: ToolStatus.ACTIVE,
                createdById: '00000000-0000-0000-0000-000000000000',
            });

            // If practiceIds are provided, establish practice relationships
            if (practiceIds && Array.isArray(practiceIds)) {
                const practices = await practiceRepository.findBy({ id: In(practiceIds) });
                tool.practices = practices;
            }

            // If clientIds are provided, establish client relationships
            if (clientIds && Array.isArray(clientIds)) {
                const clients = await clientRepository.findBy({ id: In(clientIds) });
                tool.clients = clients;
            }

            const result = await toolRepository.save(tool);
            res.status(201).json(result);
            return
        } catch (error) {
             res.status(500).json({ message: 'Error creating tool', error });
             return
        }
    }

    // Get all tools
    getAll = async (req: Request, res: Response) => {
        try {
            const tools = await toolRepository.find({
                relations: ['practices', 'clients']
            });
            res.status(200).json(tools);
            return
        } catch (error) {
            res.status(500).json({ message: 'Error fetching tools', error: error});
            return
        }
    }

    // Get a single tool by ID
    getOne = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const tool = await toolRepository.findOne({
                where: { id },
                relations: ['practices', 'clients']
            });

            if (!tool) {
                 res.status(404).json({ message: 'Tool not found' });
                 return
            }

             res.status(200).json(tool);
             return
        } catch (error) {
             res.status(500).json({ message: 'Error fetching tool', error });
             return
        }
    }

    // Update a tool
    update = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name, category, executionUrl, startingPrompt, sessionMemory, status } = req.body;

            const tool = await toolRepository.findOne({
                where: { id }
            });

            if (!tool) {
                res.status(404).json({ message: 'Tool not found' });
                return
            }

            if (name) tool.name = name;
            if (category) tool.category = category;
            if (executionUrl) tool.executionUrl = executionUrl;
            if (startingPrompt !== undefined) tool.startingPrompt = startingPrompt;
            if (sessionMemory !== undefined) tool.sessionMemory = sessionMemory;
            if (status) tool.status = status;

            const result = await toolRepository.save(tool);
            res.status(200).json(result);
            return
        } catch (error) {
            res.status(500).json({ message: 'Error updating tool', error });
            return
        }
    }

    // Delete a tool
    delete = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const tool = await toolRepository.findOne({
                where: { id }
            });

            if (!tool) {
                res.status(404).json({ message: 'Tool not found' });
                return
            }

            await toolRepository.remove(tool);
            res.status(204).send();
            return
        } catch (error) {
            res.status(500).json({ message: 'Error deleting tool', error });
            return
        }
    }

    // Update tool status
    updateStatus = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!Object.values(ToolStatus).includes(status)) {
                res.status(400).json({ message: 'Invalid status value' });
                return
            }

            const tool = await toolRepository.findOne({
                where: { id }
            });

            if (!tool) {
                res.status(404).json({ message: 'Tool not found' });
                return
            }

            tool.status = status;
            const result = await toolRepository.save(tool);
            res.status(200).json(result);
            return
        } catch (error) {
             res.status(500).json({ message: 'Error updating tool status', error });
             return
        }
    }
} 