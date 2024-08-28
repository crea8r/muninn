-- Insert data into the org table
INSERT INTO org (name, profile, created_at) 
VALUES 
('SuperteamUK', '{"description": "A collaborative team focusing on blockchain development and startup projects."}', CURRENT_TIMESTAMP);

-- Insert data into the creator table
INSERT INTO creator (username, pwd, profile, role, org_id)
VALUES 
('cap', 'hashed_password', '{"bio": "Lead developer and organizer at SuperteamUK"}', 'admin', 1),
('micheal', 'hashed_password', '{"bio": "Full-stack developer at SuperteamUK"}', 'member', 1),
('arch', 'hashed_password', '{"bio": "Content creator and marketer"}', 'member', 1),
('cza', 'hashed_password', '{"bio": "Backend developer and system architect"}', 'member', 1),
('hieu', 'hashed_password', '{"bio": "Blockchain developer and project manager"}', 'member', 1),
('jack', 'hashed_password', '{"bio": "Frontend developer and UI/UX designer"}', 'member', 1);

-- Insert popular tags into the tag table
INSERT INTO tag (name, color_schema, org_id)
VALUES
('Blockchain', '{"primary": "#f7931a", "secondary": "#ffcd01"}', 1),
('Startup', '{"primary": "#007bff", "secondary": "#6c757d"}', 1),
('Hackathon', '{"primary": "#28a745", "secondary": "#dc3545"}', 1),
('DeFi', '{"primary": "#6f42c1", "secondary": "#e83e8c"}', 1),
('NFT', '{"primary": "#ffc107", "secondary": "#20c997"}', 1),
('AI', '{"primary": "#17a2b8", "secondary": "#6610f2"}', 1),
('Web3', '{"primary": "#343a40", "secondary": "#adb5bd"}', 1),
('Community', '{"primary": "#ff5733", "secondary": "#c70039"}', 1),
('Bounty', '{"primary": "#900c3f", "secondary": "#581845"}', 1),
('OpenSource', '{"primary": "#33cc33", "secondary": "#ff9966"}', 1);

-- Insert object types into the obj_type table
INSERT INTO obj_type (name, description, fields, creator_id)
VALUES 
('developer', 'An individual who writes code and builds software.', '{"github": "", "email": ""}', 5),
('project', 'A specific endeavor with defined goals and deliverables.', '{"project_link": "", "description": ""}', 5),
('artist', 'A creative individual who produces visual, auditory, or other forms of artistic work.', '{"portfolio_link": ""}', 5);

-- Insert funnels into the funnel table
INSERT INTO funnel (name, description, creator_id)
VALUES 
('dev journey', 'A funnel for developers progressing through skill levels.', 1),
('startup journey', 'A funnel for startups moving from idea to market.', 1),
('radar hackathon', 'A funnel for hackathon participants from team formation to submission.', 1);

-- Insert steps into the step table for each funnel
INSERT INTO step (funnel_id, name, definition, example, action, parent_step, created_at)
VALUES 
-- dev journey steps
(1, 'beginner', 'Starting out as a developer, learning basic programming concepts.', NULL, NULL, NULL, CURRENT_TIMESTAMP),
(1, 'intermediate', 'Developer with a few projects under their belt.', NULL, NULL, 1, CURRENT_TIMESTAMP),
(1, 'advanced', 'Seasoned developer contributing to major projects.', NULL, NULL, 2, CURRENT_TIMESTAMP),
-- startup journey steps
(2, 'mvp', 'Minimum viable product ready for initial launch.', NULL, NULL, NULL, CURRENT_TIMESTAMP),
(2, 'fund raising', 'Startup actively seeking funding.', NULL, NULL, 4, CURRENT_TIMESTAMP),
(2, 'product market fit', 'Startup has achieved a product-market fit.', NULL, NULL, 5, CURRENT_TIMESTAMP),
-- radar hackathon steps
(3, 'team ready', 'Team formation completed.', NULL, NULL, NULL, CURRENT_TIMESTAMP),
(3, 'project ready', 'Project concept is ready for execution.', NULL, NULL, 7, CURRENT_TIMESTAMP),
(3, 'material done', 'All required materials are ready for submission.', NULL, NULL, 8, CURRENT_TIMESTAMP),
(3, 'submission', 'Project has been submitted.', NULL, NULL, 9, CURRENT_TIMESTAMP);

-- Insert objects into the obj table
INSERT INTO obj (name, description, creator_id, created_at)
VALUES 
-- hieu's objects
('Dev1', 'Developer specializing in smart contracts.', 5, CURRENT_TIMESTAMP),
('Dev2', 'Full-stack developer interested in DeFi projects.', 5, CURRENT_TIMESTAMP),
('Dev3', 'AI developer with a focus on blockchain.', 5, CURRENT_TIMESTAMP),
('Dev4', 'Developer experienced in NFT platforms.', 5, CURRENT_TIMESTAMP),
('Dev5', 'Frontend developer with a passion for Web3.', 5, CURRENT_TIMESTAMP),
('Project1', 'A DeFi project focusing on decentralized exchanges.', 5, CURRENT_TIMESTAMP),
('Project2', 'An NFT marketplace.', 5, CURRENT_TIMESTAMP),
('Project3', 'AI-driven blockchain analytics platform.', 5, CURRENT_TIMESTAMP),
-- micheal's objects
('Dev6', 'Backend developer with experience in smart contracts.', 2, CURRENT_TIMESTAMP),
('Dev7', 'Developer building decentralized applications.', 2, CURRENT_TIMESTAMP),
('Dev8', 'Full-stack developer in the Web3 space.', 2, CURRENT_TIMESTAMP),
('Project4', 'A community-driven DeFi protocol.', 2, CURRENT_TIMESTAMP),
('Project5', 'An open-source blockchain toolset.', 2, CURRENT_TIMESTAMP),
-- cap's objects
('Dev9', 'Developer with a focus on blockchain scalability.', 1, CURRENT_TIMESTAMP),
('Dev10', 'Developer working on privacy-focused projects.', 1, CURRENT_TIMESTAMP),
('Project6', 'A privacy-focused blockchain protocol.', 1, CURRENT_TIMESTAMP),
('Project7', 'A scalable blockchain infrastructure project.', 1, CURRENT_TIMESTAMP),
('Project8', 'A decentralized social media platform.', 1, CURRENT_TIMESTAMP);

-- Insert facts into the fact table
INSERT INTO fact (text, happened_at, location, creator_id, created_at)
VALUES 
-- cap's facts
('Met 5 projects at BuildStop.', NULL, 'BuildStop', 1, CURRENT_TIMESTAMP),
('Met 3 projects at London Startup Village.', NULL, 'London Startup Village', 1, CURRENT_TIMESTAMP),
-- hieu's facts
('Pushed bounty invitation to 4 developers.', NULL, NULL, 5, CURRENT_TIMESTAMP),
-- arch's facts
('Promoted content for 3 projects.', NULL, NULL, 3, CURRENT_TIMESTAMP);

-- Insert tasks into the task table
INSERT INTO task (content, deadline, remind_at, status, creator_id, assigned_id, parent_id, created_at)
VALUES 
('Complete project1 review', '2024-09-01', '2024-08-25', 'todo', 1, 5, NULL, CURRENT_TIMESTAMP),
('Follow up with Dev2 on bounty', '2024-09-05', '2024-08-30', 'doing', 1, 5, NULL, CURRENT_TIMESTAMP),
('Finalize hackathon materials for project8', '2024-09-10', '2024-09-05', 'paused', 1, 2, NULL, CURRENT_TIMESTAMP),
('Prepare funding pitch for project6', '2024-09-15', '2024-09-10', 'completed', 1, 2, NULL, CURRENT_TIMESTAMP),
('Update project7 documentation', '2024-09-20', '2024-09-15', 'todo', 1, 5, NULL, CURRENT_TIMESTAMP),
('Conduct code review for Dev10', '2024-09-25', '2024-09-20', 'doing', 1, 2, NULL, CURRENT_TIMESTAMP),
('Plan community outreach for project4', '2024-09-30', '2024-09-25', 'todo', 1, 5, NULL, CURRENT_TIMESTAMP);

-- Link tasks with objects (obj_task table)
INSERT INTO obj_task (obj_id, task_id)
VALUES
(6, 1), -- Link task 1 with project1
(2, 2), -- Link task 2 with Dev2
(15, 3), -- Link task 3 with project8
(14, 4), -- Link task 4 with project6
(14, 5), -- Link task 5 with project7
(9, 6), -- Link task 6 with Dev10
(10, 7); -- Link task 7 with project4

-- Link objects with facts (obj_fact table)
INSERT INTO obj_fact (obj_id, fact_id)
VALUES
(6, 1), -- Link project1 with cap's fact 1
(13, 2), -- Link project7 with cap's fact 2
(2, 3), -- Link Dev2 with hieu's fact 3
(6, 4); -- Link project1 with arch's fact 4