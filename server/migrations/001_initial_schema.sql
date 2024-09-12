-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS obj_fact CASCADE;
DROP TABLE IF EXISTS obj_task CASCADE;
DROP TABLE IF EXISTS obj_tag CASCADE;
DROP TABLE IF EXISTS obj_type_value CASCADE;
DROP TABLE IF EXISTS obj_step CASCADE;
DROP TABLE IF EXISTS creator_list CASCADE;
DROP TABLE IF EXISTS creator_session CASCADE;
DROP TABLE IF EXISTS feed CASCADE;
DROP TABLE IF EXISTS list CASCADE;
DROP TABLE IF EXISTS obj CASCADE;
DROP TABLE IF EXISTS task CASCADE;
DROP TABLE IF EXISTS fact CASCADE;
DROP TABLE IF EXISTS step CASCADE;
DROP TABLE IF EXISTS funnel CASCADE;
DROP TABLE IF EXISTS obj_type CASCADE;
DROP TABLE IF EXISTS tag CASCADE;
DROP TABLE IF EXISTS creator CASCADE;
DROP TABLE IF EXISTS org CASCADE;

-- Create the org table
CREATE TABLE org (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    profile JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create the creator table
CREATE TABLE creator (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    profile JSONB NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'member')) NOT NULL,
    org_id UUID NOT NULL REFERENCES org(id) ON DELETE CASCADE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (username, org_id)
);

-- Create the creator_session table
CREATE TABLE creator_session (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    jwt TEXT NOT NULL,
    expired_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the tag table
CREATE TABLE tag (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color_schema JSONB NOT NULL,
    org_id UUID NOT NULL REFERENCES org(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (name, org_id)
);

-- Create the obj_type table
CREATE TABLE obj_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    fields JSONB NOT NULL,
    creator_id UUID REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create the funnel table
CREATE TABLE funnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create the step table
CREATE TABLE step (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_id UUID REFERENCES funnel(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    definition TEXT,
    example TEXT,
    action TEXT,
    parent_step UUID REFERENCES step(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create the fact table
CREATE TABLE fact (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    happened_at TIMESTAMP WITH TIME ZONE,
    location TEXT,
    creator_id UUID REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create the task table
CREATE TABLE task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    remind_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) CHECK (status IN ('todo', 'doing', 'paused', 'completed')) NOT NULL,
    creator_id UUID REFERENCES creator(id) ON DELETE CASCADE,
    assigned_id UUID REFERENCES creator(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES task(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create the obj table
CREATE TABLE obj (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    description TEXT,
    id_string TEXT NOT NULL,
    creator_id UUID REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (id_string, creator_id)
);

-- Create the list table
CREATE TABLE list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    filter_setting JSONB NOT NULL,
    creator_id UUID REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create the feed table
CREATE TABLE feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    seen BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create linking tables with composite primary keys
CREATE TABLE obj_fact (
    obj_id UUID REFERENCES obj(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES fact(id) ON DELETE CASCADE,
    PRIMARY KEY (obj_id, fact_id)
);

CREATE TABLE obj_task (
    obj_id UUID REFERENCES obj(id) ON DELETE CASCADE,
    task_id UUID REFERENCES task(id) ON DELETE CASCADE,
    PRIMARY KEY (obj_id, task_id)
);

CREATE TABLE obj_tag (
    obj_id UUID REFERENCES obj(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tag(id) ON DELETE CASCADE,
    PRIMARY KEY (obj_id, tag_id)
);

CREATE TABLE obj_type_value (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obj_id UUID REFERENCES obj(id) ON DELETE CASCADE,
    type_id UUID REFERENCES obj_type(id) ON DELETE CASCADE,
    values JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (obj_id, type_id)
);

CREATE TABLE obj_step (
    obj_id UUID REFERENCES obj(id) ON DELETE CASCADE,
    step_id UUID REFERENCES step(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (obj_id, step_id)
);

CREATE TABLE creator_list (
    creator_id UUID REFERENCES creator(id) ON DELETE CASCADE,
    list_id UUID REFERENCES list(id) ON DELETE CASCADE,
    params JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (creator_id, list_id)
);

-- Add indexes to foreign keys and frequently queried columns
CREATE INDEX idx_creator_org_id ON creator(org_id);
CREATE INDEX idx_creator_session_creator_id ON creator_session(creator_id);
CREATE INDEX idx_tag_org_id ON tag(org_id);
CREATE INDEX idx_obj_type_creator_id ON obj_type(creator_id);
CREATE INDEX idx_funnel_creator_id ON funnel(creator_id);
CREATE INDEX idx_step_funnel_id ON step(funnel_id);
CREATE INDEX idx_fact_creator_id ON fact(creator_id);
CREATE INDEX idx_task_creator_id ON task(creator_id);
CREATE INDEX idx_task_assigned_id ON task(assigned_id);
CREATE INDEX idx_obj_creator_id ON obj(creator_id);
CREATE INDEX idx_feed_creator_id ON feed(creator_id);
CREATE INDEX idx_creator_username ON creator(username);
CREATE INDEX idx_obj_name ON obj(name);
CREATE INDEX idx_obj_id_string ON obj(id_string);
CREATE INDEX idx_task_status ON task(status);
CREATE INDEX idx_fact_happened_at ON fact(happened_at);

-- Create a function to flatten JSON
CREATE OR REPLACE FUNCTION jsonb_to_text(jsonb_data JSONB) RETURNS TEXT AS $$
DECLARE
  result TEXT := '';
  key TEXT;
  value JSONB;
BEGIN
  FOR key, value IN SELECT * FROM jsonb_each(jsonb_data)
  LOOP
    IF jsonb_typeof(value) = 'object' THEN
      result := result || ' ' || jsonb_to_text(value);
    ELSIF jsonb_typeof(value) = 'array' THEN
      result := result || ' ' || array_to_string(ARRAY(SELECT jsonb_array_elements_text(value)), ' ');
    ELSE
      result := result || ' ' || value#>>'{}';
    END IF;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add a tsvector column to obj_type_value
ALTER TABLE obj_type_value ADD COLUMN search_vector tsvector;

-- Create a function to generate tsvector for obj_type_value
CREATE OR REPLACE FUNCTION generate_obj_type_value_search_vector(obj_type_value_row obj_type_value) RETURNS tsvector AS $$
BEGIN
  RETURN to_tsvector('english', jsonb_to_text(obj_type_value_row.values));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a trigger to update the search vector
CREATE OR REPLACE FUNCTION obj_type_value_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := generate_obj_type_value_search_vector(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER obj_type_value_search_update
BEFORE INSERT OR UPDATE ON obj_type_value
FOR EACH ROW EXECUTE FUNCTION obj_type_value_search_trigger();

-- Create a GIN index on the search vector
CREATE INDEX obj_type_value_search_idx ON obj_type_value USING GIN (search_vector);

-- Update existing data
UPDATE obj_type_value SET search_vector = generate_obj_type_value_search_vector(obj_type_value);

-- Triggers to update last_updated field on update
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the tables that have last_updated field
CREATE TRIGGER update_step_last_updated
BEFORE UPDATE ON step
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER update_fact_last_updated
BEFORE UPDATE ON fact
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER update_task_last_updated
BEFORE UPDATE ON task
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER update_list_last_updated
BEFORE UPDATE ON list
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER update_obj_type_value_last_updated
BEFORE UPDATE ON obj_type_value
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER update_obj_step_last_updated
BEFORE UPDATE ON obj_step
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER update_creator_list_last_updated
BEFORE UPDATE ON creator_list
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

-- Add CHECK constraints
ALTER TABLE creator ADD CONSTRAINT check_username_length CHECK (LENGTH(username) >= 3);
ALTER TABLE task ADD CONSTRAINT check_deadline_after_created CHECK (deadline > created_at);

COMMENT ON TABLE obj_type_value IS 'This table has full-text search capabilities on its JSON data';
COMMENT ON COLUMN obj_type_value.search_vector IS 'This column contains the tsvector for full-text search';