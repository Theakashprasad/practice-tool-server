import { DataSource } from 'typeorm';
import { Practice } from '../models/Practice';
import { ClientGroup } from '../models/ClientGroup';
import { Client } from '../models/Client';
import { Contact } from '../models/Contact';
import { Link } from '../models/Link';
import { ServiceSubscribed } from '../models/ServiceSubscribed';
import { ServiceType } from '../models/ServiceType';
import { Industry } from '../models/Industry';
import { Tool, ToolSession } from '../models/Tool';
// Enum-only or interface-only files (ServiceLevel, StaffRole, staffModel, userModel, UserPreferences, invitationModel, ChatSession) are not entities and should not be included.
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Practice, ClientGroup, Client, Contact, Link, ServiceSubscribed, ServiceType, Industry, Tool, ToolSession],
    synchronize: true, // Be careful with this in production
    ssl: {
        rejectUnauthorized: false // Required for Neon DB
    }
}); 