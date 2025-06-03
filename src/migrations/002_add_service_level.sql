-- Create the service_level enum type
DO $$ BEGIN
    CREATE TYPE service_level AS ENUM (
        'Self Service',
        'Full Service',
        'Tax Only',
        'Valet',
        'Coaching Only',
        'Casual'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add service_level and description columns to practices table
ALTER TABLE practices
ADD COLUMN IF NOT EXISTS service_level service_level NOT NULL DEFAULT 'Full Service',
ADD COLUMN IF NOT EXISTS description TEXT; 