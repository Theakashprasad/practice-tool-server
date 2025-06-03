import { DataSource } from 'typeorm';
import { Tool } from '../models/Tool';
import { Practice } from '../models/Practice';
import { Client } from '../models/Client';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'practice_tool',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
    entities: [Tool, Practice, Client],
    migrations: ['src/db/migrations/*.ts'],
    subscribers: [],
}); 