-- Drop tables if they exist
DROP TABLE IF EXISTS creator_list CASCADE;
DROP TABLE IF EXISTS obj_step CASCADE;
DROP TABLE IF EXISTS obj_type_value CASCADE;
DROP TABLE IF EXISTS obj_tag CASCADE;
DROP TABLE IF EXISTS obj_task CASCADE;
DROP TABLE IF EXISTS obj_fact CASCADE;
DROP TABLE IF EXISTS list CASCADE;
DROP TABLE IF EXISTS obj CASCADE;
DROP TABLE IF EXISTS task CASCADE;
DROP TABLE IF EXISTS fact CASCADE;
DROP TABLE IF EXISTS step CASCADE;
DROP TABLE IF EXISTS funnel CASCADE;
DROP TABLE IF EXISTS obj_type CASCADE;
DROP TABLE IF EXISTS tag CASCADE;
DROP TABLE IF EXISTS creator_session CASCADE;
DROP TABLE IF EXISTS creator CASCADE;
DROP TABLE IF EXISTS org CASCADE;

-- Create org table
CREATE TABLE org (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    profile JSON NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create creator table
CREATE TABLE creator (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    profile JSON NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'member')),
    org_id INT REFERENCES org(id) ON DELETE CASCADE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username, org_id)
);

-- Create creator_session table
CREATE TABLE creator_session (
    id SERIAL PRIMARY KEY,
    creator_id INT REFERENCES creator(id) ON DELETE CASCADE,
    jwt TEXT NOT NULL,
    expired_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create tag table
CREATE TABLE tag (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color_schema JSON NOT NULL,
    org_id INT REFERENCES org(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, org_id)
);

-- Create obj_type table
CREATE TABLE obj_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    fields JSON NOT NULL,
    creator_id INT REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create funnel table
CREATE TABLE funnel (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id INT REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create step table
CREATE TABLE step (
    id SERIAL PRIMARY KEY,
    funnel_id INT REFERENCES funnel(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    definition TEXT,
    example TEXT,
    action TEXT,
    parent_step INT REFERENCES step(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create fact table
CREATE TABLE fact (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    happened_at TIMESTAMPTZ,
    location TEXT,
    creator_id INT REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create task table
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    remind_at TIMESTAMPTZ,
    status VARCHAR(50) CHECK (status IN ('todo', 'doing', 'paused', 'completed')),
    creator_id INT REFERENCES creator(id) ON DELETE CASCADE,
    assigned_id INT REFERENCES creator(id),
    parent_id INT REFERENCES task(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create obj table
CREATE TABLE obj (
    id SERIAL PRIMARY KEY,
    name TEXT,
    description TEXT,
    id_string TEXT NOT NULL,
    creator_id INT REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_string, creator_id)
);

-- Create list table
CREATE TABLE list (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    filter_setting JSON NOT NULL,
    creator_id INT REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create linking tables

CREATE TABLE obj_fact (
    obj_id INT REFERENCES obj(id) ON DELETE CASCADE,
    fact_id INT REFERENCES fact(id) ON DELETE CASCADE,
    PRIMARY KEY (obj_id, fact_id)
);

CREATE TABLE obj_task (
    obj_id INT REFERENCES obj(id) ON DELETE CASCADE,
    task_id INT REFERENCES task(id) ON DELETE CASCADE,
    PRIMARY KEY (obj_id, task_id)
);

CREATE TABLE obj_tag (
    obj_id INT REFERENCES obj(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tag(id) ON DELETE CASCADE,
    PRIMARY KEY (obj_id, tag_id)
);

CREATE TABLE obj_type_value (
    obj_id INT REFERENCES obj(id) ON DELETE CASCADE,
    type_id INT REFERENCES obj_type(id) ON DELETE CASCADE,
    values JSON NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (obj_id, type_id)
);

CREATE TABLE obj_step (
    obj_id INT REFERENCES obj(id) ON DELETE CASCADE,
    step_id INT REFERENCES step(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (obj_id, step_id)
);

CREATE TABLE creator_list (
    creator_id INT REFERENCES creator(id) ON DELETE CASCADE,
    list_id INT REFERENCES list(id) ON DELETE CASCADE,
    params JSON NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (creator_id, list_id)
);

-- Trigger functions and triggers for updating last_updated

CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers to tables that have the last_updated column

CREATE TRIGGER update_last_updated_step
BEFORE UPDATE ON step
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();

CREATE TRIGGER update_last_updated_fact
BEFORE UPDATE ON fact
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();

CREATE TRIGGER update_last_updated_task
BEFORE UPDATE ON task
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();

CREATE TRIGGER update_last_updated_list
BEFORE UPDATE ON list
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();

CREATE TRIGGER update_last_updated_obj_type_value
BEFORE UPDATE ON obj_type_value
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();

CREATE TRIGGER update_last_updated_obj_step
BEFORE UPDATE ON obj_step
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();

CREATE TRIGGER update_last_updated_creator_list
BEFORE UPDATE ON creator_list
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();