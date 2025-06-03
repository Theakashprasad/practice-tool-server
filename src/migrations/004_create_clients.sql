-- Create client structure enum
DO $$ BEGIN
    CREATE TYPE client_structure AS ENUM ('Ind', 'Corp', 'Charity', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create client status enum
DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('Prospect', 'Current', 'Dormant', 'Ceased');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create accounting system enum
DO $$ BEGIN
    CREATE TYPE accounting_system AS ENUM ('Xero', 'QBO', 'None', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    structure client_structure NOT NULL DEFAULT 'Ind',
    client_group_id UUID NOT NULL REFERENCES client_groups(id) ON DELETE SET NULL,
    jurisdiction VARCHAR(255) NOT NULL,
    reg_id VARCHAR(255),
    year_end DATE,
    tax_ids JSONB,
    status client_status NOT NULL DEFAULT 'Prospect',
    service_start_date DATE,
    service_end_date DATE,
    staff_partner_id UUID,
    staff_manager1_id UUID,
    staff_manager2_id UUID,
    staff_accountant_ids TEXT[],
    staff_bookkeeper1_id UUID,
    staff_bookkeeper2_id UUID,
    staff_tax_specialist_id UUID,
    staff_other1_id UUID,
    staff_other2_id UUID,
    staff_other3_id UUID,
    staff_other4_id UUID,
    staff_other5_id UUID,
    staff_admin1_id UUID,
    staff_admin2_id UUID,
    industry VARCHAR(255),
    accounting_system accounting_system NOT NULL DEFAULT 'None',
    service_level VARCHAR(255),
    comments TEXT,
    link_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 