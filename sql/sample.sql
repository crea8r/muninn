-- Insert data into org table
INSERT INTO org (name, profile, created_at) 
VALUES ('SuperteamUK', '{"description": "A leading innovation team"}', CURRENT_TIMESTAMP);

-- Insert data into creator table
INSERT INTO creator (username, pwd, profile, role, org_id, active, created_at)
VALUES 
('cap', MD5('superteamuk'), '{"full_name": "Cap"}', 'admin', 1, TRUE, CURRENT_TIMESTAMP),
('micheal', MD5('superteamuk'), '{"full_name": "Micheal"}', 'member', 1, TRUE, CURRENT_TIMESTAMP),
('arch', MD5('superteamuk'), '{"full_name": "Arch"}', 'member', 1, TRUE, CURRENT_TIMESTAMP),
('cza', MD5('superteamuk'), '{"full_name": "Cza"}', 'member', 1, TRUE, CURRENT_TIMESTAMP),
('hieu', MD5('superteamuk'), '{"full_name": "Hieu"}', 'member', 1, TRUE, CURRENT_TIMESTAMP),
('jack', MD5('superteamuk'), '{"full_name": "Jack"}', 'member', 1, TRUE, CURRENT_TIMESTAMP);

-- Insert data into tag table
INSERT INTO tag (name, description, color_schema, org_id, created_at)
VALUES 
('Innovation', 'Focuses on innovative projects', '{"color": "#FF5733"}', 1, CURRENT_TIMESTAMP),
('Growth', 'Relates to growth hacking and scaling', '{"color": "#33FF57"}', 1, CURRENT_TIMESTAMP),
('Technology', 'Covers tech-related endeavors', '{"color": "#3357FF"}', 1, CURRENT_TIMESTAMP);

-- Insert data into obj_type table
INSERT INTO obj_type (name, description, fields, creator_id, created_at)
VALUES 
('developer', 'Software developers', '{"skills": ["coding", "debugging"], "experience": "years"}', 1, CURRENT_TIMESTAMP),
('project', 'Project details', '{"goal": "string", "deadline": "date"}', 1, CURRENT_TIMESTAMP),
('artist', 'Artists and creative professionals', '{"portfolio": "url", "medium": "string"}', 1, CURRENT_TIMESTAMP);

-- Insert data into funnel table
INSERT INTO funnel (name, description, creator_id, created_at)
VALUES 
('dev journey', 'The journey of a developer', 1, CURRENT_TIMESTAMP),
('startup journey', 'Steps for startups', 1, CURRENT_TIMESTAMP),
('radar hackathon', 'Hackathon process', 1, CURRENT_TIMESTAMP);

-- Insert data into step table
INSERT INTO step (funnel_id, name, definition, example, action, parent_step, created_at, last_updated)
VALUES 
(1, 'beginner', 'Entry level for developers', 'Build a simple project', 'Learn basics', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'intermediate', 'Mid-level for developers', 'Develop a medium complexity project', 'Enhance skills', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'advanced', 'Expert level for developers', 'Lead a large-scale project', 'Master skills', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'mvp', 'Minimum viable product', 'Launch a basic version', 'Build MVP', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'fund raising', 'Raise capital', 'Secure initial funding', 'Pitch to investors', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'product market fit', 'Align product with market demand', 'Achieve market validation', 'Market testing', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'team ready', 'Form a team', 'Recruit team members', 'Team formation', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'project ready', 'Prepare project', 'Define project scope', 'Project planning', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'material done', 'Finish project materials', 'Complete documentation', 'Final touches', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'submission', 'Submit project', 'Send final version', 'Project submission', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert data into obj table
INSERT INTO obj (name, description, id_string, creator_id, created_at)
VALUES 
('John Doe', 'A senior developer', 'john.doe@example.com', 5, CURRENT_TIMESTAMP),
('Jane Smith', 'A front-end developer', 'jane.smith@example.com', 5, CURRENT_TIMESTAMP),
('Michael Johnson', 'A back-end developer', 'michael.johnson@example.com', 5, CURRENT_TIMESTAMP),
('Art Pro', 'An experienced artist', 'art.pro@example.com', 2, CURRENT_TIMESTAMP),
('Creative Vision', 'A digital artist', 'creative.vision@example.com', 2, CURRENT_TIMESTAMP),
('Innovative Works', 'A project focused on tech innovation', 'http://innoworks.com', 2, CURRENT_TIMESTAMP),
('Future Tech', 'A cutting-edge tech project', 'http://futuretech.com', 1, CURRENT_TIMESTAMP),
('Startup Hub', 'A project aimed at startups', 'http://startuphut.com', 1, CURRENT_TIMESTAMP);

-- Insert data into obj_type_value table to link objects with types
INSERT INTO obj_type_value (obj_id, type_id, values, created_at, last_updated)
VALUES 
(1, 1, '{"skills": ["Java", "Spring"], "experience": "5 years"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, '{"skills": ["React", "CSS"], "experience": "3 years"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, '{"skills": ["Node.js", "MongoDB"], "experience": "4 years"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 3, '{"portfolio": "http://artpro.com", "medium": "Painting"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 3, '{"portfolio": "http://creativevision.com", "medium": "Digital Art"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 2, '{"goal": "Launch an innovative platform", "deadline": "2025-12-31"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 2, '{"goal": "Develop cutting-edge technology", "deadline": "2024-11-30"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 2, '{"goal": "Support startup ecosystem", "deadline": "2024-09-15"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert data into fact table
INSERT INTO fact (text, happened_at, location, creator_id, created_at, last_updated)
VALUES 
('Met project at BuildStop', '2024-05-15', 'BuildStop', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Met project at London Startup Village', '2024-06-01', 'London Startup Village', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Pushed bounty invitation to John Doe', '2024-07-10', NULL, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Pushed bounty invitation to Jane Smith', '2024-07-11', NULL, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Promoted content for Innovative Works', '2024-08-05', 'Online', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Promoted content for Future Tech', '2024-08-10', 'Online', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert data into task table
INSERT INTO task (content, deadline, remind_at, status, creator_id, assigned_id, parent_id, created_at, last_updated)
VALUES 
('Finalize project proposal for Future Tech', '2024-11-15', '2024-11-01', 'todo', 1, 5, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Prepare marketing materials for Startup Hub', '2024-09-10', '2024-09-05', 'doing', 1, 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Coordinate with dev team for Future Tech', '2024-11-20', '2024-11-10', 'todo', 1, 5, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert data into obj_task table to link objects with tasks
INSERT INTO obj_task (obj_id, task_id)
VALUES 
(7, 1),
(8, 2),
(7, 3);