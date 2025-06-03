import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { AppDataSource } from './typeorm';

dotenv.config();

export const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

export const runMigrations = async () => {
  try {
    // Run migrations in order
    const migrations = [
      '001_create_users_table.sql',
      '002_add_service_level.sql',
      '003_create_client_groups.sql',
      '004_create_clients.sql',
      '005_create_industries.sql',
      '006_create_service_types.sql',
      '002_create_chat_tables.sql'
    ];

    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, '../migrations', migrationFile);
      const migration = fs.readFileSync(migrationPath, 'utf8');
      await client.query(migration);
      console.log(`Migration ${migrationFile} completed successfully`);
    }
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  }
};

export const connectDB = async () => {
  try {
    // Connect PostgreSQL client
    await client.connect();
    console.log('Connected to NeonDB!');
    await runMigrations();

    // Initialize TypeORM
    await AppDataSource.initialize();
    console.log('TypeORM Data Source has been initialized!');
  } catch (err) {
    console.error('DB connection failed:', err);
    throw err;
  }
};
