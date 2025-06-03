-- Drop the old industry column if it exists
ALTER TABLE clients DROP COLUMN IF EXISTS industry;

-- Add the new industry relationship
ALTER TABLE clients ADD COLUMN industry_id UUID REFERENCES industries(id) ON DELETE SET NULL; 