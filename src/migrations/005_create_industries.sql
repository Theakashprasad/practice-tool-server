-- Create industries table
CREATE TABLE IF NOT EXISTS industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial industry data
INSERT INTO industries (name) VALUES
('Agriculture'),
('Mining'),
('Manufacturing'), 
('Construction'),
('Retail'),
('Hospitality'),
('Transport'),
('Technology'),
('Finance'),
('Real Estate'),
('Professional Services'),
('Education'),
('Healthcare'),
('Arts'),
('Other Services')
ON CONFLICT (name) DO NOTHING;