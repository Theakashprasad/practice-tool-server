-- Create enum type for tool status
DO $$ BEGIN
    CREATE TYPE "public"."tools_status_enum" AS ENUM ('Active', 'Inactive', 'Archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tools table
CREATE TABLE IF NOT EXISTS "tools" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" character varying(255) NOT NULL,
    "category" character varying(100) NOT NULL,
    "executionUrl" text NOT NULL,
    "startingPrompt" text,
    "sessionMemory" boolean NOT NULL DEFAULT false,
    "createdById" uuid NOT NULL,
    "status" "public"."tools_status_enum" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_tools" PRIMARY KEY ("id")
);

-- Create tool_sessions table
CREATE TABLE IF NOT EXISTS "tool_sessions" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "toolId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "contextMeta" jsonb,
    "sessionData" jsonb,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_tool_sessions" PRIMARY KEY ("id")
);

-- Create tool_practice_map table
CREATE TABLE IF NOT EXISTS "tool_practice_map" (
    "tool_id" uuid NOT NULL,
    "practice_id" uuid NOT NULL,
    CONSTRAINT "PK_tool_practice_map" PRIMARY KEY ("tool_id", "practice_id")
);

-- Create tool_client_entity_map table
CREATE TABLE IF NOT EXISTS "tool_client_entity_map" (
    "tool_id" uuid NOT NULL,
    "client_entity_id" uuid NOT NULL,
    CONSTRAINT "PK_tool_client_entity_map" PRIMARY KEY ("tool_id", "client_entity_id")
);

-- Add foreign key constraints
DO $$ BEGIN
    ALTER TABLE "tools" 
    ADD CONSTRAINT "FK_tools_created_by" 
    FOREIGN KEY ("createdById") 
    REFERENCES "users"("id") 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tool_sessions" 
    ADD CONSTRAINT "FK_tool_sessions_tool" 
    FOREIGN KEY ("toolId") 
    REFERENCES "tools"("id") 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tool_sessions" 
    ADD CONSTRAINT "FK_tool_sessions_user" 
    FOREIGN KEY ("userId") 
    REFERENCES "users"("id") 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tool_practice_map" 
    ADD CONSTRAINT "FK_tool_practice_map_tool" 
    FOREIGN KEY ("tool_id") 
    REFERENCES "tools"("id") 
    ON DELETE CASCADE 
    ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tool_practice_map" 
    ADD CONSTRAINT "FK_tool_practice_map_practice" 
    FOREIGN KEY ("practice_id") 
    REFERENCES "practices"("id") 
    ON DELETE CASCADE 
    ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tool_client_entity_map" 
    ADD CONSTRAINT "FK_tool_client_entity_map_tool" 
    FOREIGN KEY ("tool_id") 
    REFERENCES "tools"("id") 
    ON DELETE CASCADE 
    ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tool_client_entity_map" 
    ADD CONSTRAINT "FK_tool_client_entity_map_client" 
    FOREIGN KEY ("client_entity_id") 
    REFERENCES "clients"("id") 
    ON DELETE CASCADE 
    ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$; 