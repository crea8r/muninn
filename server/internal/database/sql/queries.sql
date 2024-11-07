-- name: GetCreator :one
SELECT * FROM creator WHERE id = $1 LIMIT 1;

-- name: GetCreatorByUsername :one
SELECT c.*, o.name as orgName FROM creator c
JOIN org o ON c.org_id = o.id
WHERE username = $1 AND active = $2;

-- name: CreateCreator :one
INSERT INTO creator (username, pwd, profile, role, org_id, active, created_at)
VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
RETURNING *;

-- name: DeleteCreator :exec
UPDATE creator SET deleted_at = NOW() WHERE id = $1;

-- name: GetCreatorByID :one
SELECT * FROM creator WHERE id = $1 LIMIT 1;

-- name: CreateFeed :one
INSERT INTO feed (creator_id, content, seen)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetFeed :many
SELECT * FROM feed
WHERE creator_id = $1 AND seen = false
ORDER BY created_at DESC
LIMIT 10;

-- name: MarkFeedAsSeen :exec
UPDATE feed
SET seen = true
WHERE id = ANY($1::uuid[]);

-- name: CreateOrganization :one
INSERT INTO org (name, profile, created_at)
VALUES ($1, $2, CURRENT_TIMESTAMP)
RETURNING *;

-- Setting/Tag section

-- name: CreateTag :one
INSERT INTO tag (name, description, color_schema, org_id)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdateTag :one
UPDATE tag
SET description = $2, color_schema = $3
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: DeleteTag :execrows
DELETE FROM tag 
WHERE id = $1 AND deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM obj_tag WHERE tag_id = $1
  );

-- name: ListTags :many
SELECT t.id, t.name, t.description, t.color_schema, t.created_at
FROM tag t
WHERE t.org_id = $1
  AND t.deleted_at IS NULL
  AND ($2::text = '' OR (t.name ILIKE '%' || $2 || '%' OR t.description ILIKE '%' || $2 || '%'))
ORDER BY t.created_at DESC
LIMIT $3 OFFSET $4;

-- name: GetTagByID :one
SELECT * FROM tag
WHERE id = $1 AND deleted_at IS NULL
LIMIT 1;

-- name: CountTags :one
SELECT COUNT(*) 
FROM tag
WHERE org_id = $1
  AND deleted_at IS NULL
  AND ($2::text = '' OR (name ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%'));

-- name: CreateObjectType :one
INSERT INTO obj_type (name, description, fields, creator_id, icon)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: UpdateObjectType :one
UPDATE obj_type
SET name = $2, description = $3, fields = $4, icon = $5
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: DeleteObjectType :execrows
UPDATE obj_type
SET deleted_at = CURRENT_TIMESTAMP
WHERE obj_type.id = $1 AND deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM obj_type_value WHERE type_id = $1
  );

-- name: ListObjectTypes :many
SELECT o.id, o.name, o.icon, o.description, o.fields, o.created_at
FROM obj_type o
JOIN creator c ON o.creator_id = c.id
WHERE c.org_id = $1
  AND o.deleted_at IS NULL
  AND ($2::text = '' OR 
       o.name ILIKE '%' || $2 || '%' OR 
       o.description ILIKE '%' || $2 || '%' OR
       o.fields_search @@ to_tsquery('english', $2))
ORDER BY o.created_at DESC
LIMIT $3 OFFSET $4;

-- name: GetObjectTypeByID :one
SELECT * FROM obj_type
WHERE id = $1 AND deleted_at IS NULL
LIMIT 1;

-- name: CountObjectTypes :one
SELECT COUNT(*) 
FROM obj_type o
JOIN creator c ON o.creator_id = c.id
WHERE c.org_id = $1
  AND o.deleted_at IS NULL
  AND ($2::text = '' OR 
       o.name ILIKE '%' || $2 || '%' OR 
       o.description ILIKE '%' || $2 || '%' OR
       o.fields_search @@ to_tsquery('english', $2));

-- name: CreateFunnel :one
INSERT INTO funnel (id, name, description, creator_id)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetFunnel :one
SELECT f.*, c.org_id,
       (SELECT COUNT(*) FROM obj_step os
        JOIN step s ON s.id = os.step_id
        WHERE s.funnel_id = f.id) AS object_count
FROM funnel f
JOIN creator c ON c.id = f.creator_id
WHERE f.id = $1 AND f.deleted_at IS NULL;

-- name: ListFunnels :many
SELECT f.*, c.org_id,
       (SELECT COUNT(*) FROM obj_step os
        JOIN step s ON s.id = os.step_id
        WHERE s.funnel_id = f.id) AS object_count
FROM funnel f
JOIN creator c ON c.id = f.creator_id
WHERE c.org_id = $1 AND f.deleted_at IS NULL
  AND ($2::text = '' OR (
    f.name ILIKE '%' || $2 || '%' OR
    f.description ILIKE '%' || $2 || '%' OR
    EXISTS (
      SELECT 1 FROM step s
      WHERE s.funnel_id = f.id AND (
        s.name ILIKE '%' || $2 || '%' OR
        s.definition ILIKE '%' || $2 || '%' OR
        s.example ILIKE '%' || $2 || '%' OR
        s.action ILIKE '%' || $2 || '%'
      )
    )
  ))
ORDER BY f.created_at DESC
LIMIT $3 OFFSET $4;

-- name: UpdateFunnel :one
UPDATE funnel
SET name = $2, description = $3
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: DeleteFunnel :exec
UPDATE funnel
SET deleted_at = CURRENT_TIMESTAMP
WHERE funnel.id = $1 AND deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM obj_step os
    JOIN step s ON s.id = os.step_id
    WHERE s.funnel_id = $1
    AND os.deleted_at IS NULL
  );

-- name: CreateStep :one
INSERT INTO step (id, funnel_id, name, definition, example, action, step_order)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetStep :one
SELECT s.*, f.name AS funnel_name, 
       (SELECT COUNT(*) FROM obj_step os WHERE os.step_id = s.id) AS object_count
FROM step s
JOIN funnel f ON s.funnel_id = f.id
WHERE s.id = $1 AND s.deleted_at IS NULL;

-- name: UpdateStep :one
UPDATE step
SET name = $2, definition = $3, example = $4, action = $5, step_order = $6, last_updated = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: DeleteStep :exec
UPDATE step
SET deleted_at = CURRENT_TIMESTAMP
WHERE step.id = $1 AND deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM obj_step os WHERE os.step_id = $1
  );

-- name: ListStepsByFunnel :many
SELECT s.*, 
       (SELECT COUNT(*) FROM obj_step os WHERE os.step_id = s.id) AS object_count
FROM step s
WHERE s.funnel_id = $1 AND s.deleted_at IS NULL
ORDER BY s.step_order;

-- name: UpdateObjStep :exec
UPDATE obj_step
SET step_id = $2
WHERE step_id = $1;

-- name: CountFunnels :one
SELECT COUNT(*)
FROM funnel f
JOIN creator c ON c.id = f.creator_id
WHERE c.org_id = $1 AND f.deleted_at IS NULL
  AND ($2::text = '' OR (
    f.name ILIKE '%' || $2 || '%' OR
    f.description ILIKE '%' || $2 || '%' OR
    EXISTS (
      SELECT 1 FROM step s
      WHERE s.funnel_id = f.id AND (
        s.name ILIKE '%' || $2 || '%' OR
        s.definition ILIKE '%' || $2 || '%' OR
        s.example ILIKE '%' || $2 || '%' OR
        s.action ILIKE '%' || $2 || '%'
      )
    )
  ));

-- name: CreateObject :one
INSERT INTO obj (name, description, id_string, creator_id)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdateObject :one
UPDATE obj
SET name = $2, description = $3, id_string = $4
WHERE id = $1
RETURNING *;

-- name: DeleteObject :exec
UPDATE obj SET deleted_at = NOW() WHERE id = $1;

-- name: GetObjectDetails :one
WITH object_data AS (
    SELECT o.id, o.name, o.photo, o.description, o.id_string, o.creator_id, o.created_at,
           c.org_id,
           coalesce(
            json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'color_schema', t.color_schema)) FILTER (WHERE t.id IS NOT NULL), '[]') 
           AS tags,
           coalesce(json_agg(DISTINCT jsonb_build_object(
               'id', otv.id,
               'objectTypeId', ot.id,
               'objectTypeName', ot.name,
               'objectTypeIcon', ot.icon,
               'objectTypeFields', ot.fields,
               'type_values', otv.type_values
           )) FILTER (WHERE otv.id IS NOT NULL), '[]')
           AS type_values,
           coalesce(json_agg(DISTINCT jsonb_build_object(
               'id', task.id,
               'content', task.content,
               'deadline', task.deadline,
               'status', task.status,
               'createdAt', task.created_at,
               'assignedId', task.assigned_id,
               'deletedAt', task.deleted_at
           )) FILTER (WHERE task.id IS NOT NULL), '[]')
           AS tasks,
           coalesce(json_agg(DISTINCT jsonb_build_object(
               'stepId', s.id,
               'stepName', s.name,
               'funnelId', f.id,
               'funnelName', f.name,
               'subStatus', os.sub_status,
               'createdAt', os.created_at,
               'deletedAt', os.deleted_at,
               'id', os.id
           )) FILTER (WHERE s.id IS NOT NULL), '[]')
           AS steps_and_funnels,
           coalesce(json_agg(DISTINCT jsonb_build_object(
               'id', fact.id,
               'text', fact.text,
               'happenedAt', fact.happened_at,
               'location', fact.location,
               'createdAt', fact.created_at
           )) FILTER (WHERE fact.id IS NOT NULL), '[]')
           AS facts
    FROM obj o
    JOIN creator c ON o.creator_id = c.id
    LEFT JOIN obj_tag otg ON o.id = otg.obj_id
    LEFT JOIN tag t ON otg.tag_id = t.id
    LEFT JOIN obj_type_value otv ON o.id = otv.obj_id
    LEFT JOIN obj_type ot ON otv.type_id = ot.id
    LEFT JOIN obj_task ota ON o.id = ota.obj_id
    LEFT JOIN task ON ota.task_id = task.id
    LEFT JOIN obj_step os ON o.id = os.obj_id
    LEFT JOIN step s ON os.step_id = s.id
    LEFT JOIN funnel f ON s.funnel_id = f.id
    LEFT JOIN obj_fact of ON o.id = of.obj_id
    LEFT JOIN fact ON of.fact_id = fact.id
    WHERE o.id = $1 AND c.org_id = $2
    GROUP BY o.id, o.name, o.description, o.id_string, o.creator_id, o.created_at, c.org_id
)
SELECT *
FROM object_data;

-- name: AddTagToObject :exec
INSERT INTO obj_tag (obj_id, tag_id)
SELECT $1, $2
FROM obj o
JOIN creator c ON o.creator_id = c.id
JOIN tag t ON t.org_id = c.org_id
WHERE o.id = $1 AND t.id = $2 AND c.org_id = $3
ON CONFLICT DO NOTHING;

-- name: RemoveTagFromObject :exec
DELETE FROM obj_tag
WHERE obj_id = $1 AND tag_id = $2
AND EXISTS (
    SELECT 1 FROM obj o
    JOIN creator c ON o.creator_id = c.id
    WHERE o.id = $1 AND c.org_id = $3
);

-- name: AddObjectTypeValue :one
WITH org_check AS (
  SELECT
    o.id AS obj_id,
    ot.id AS obj_type_id
  FROM
    obj o
  JOIN
    creator c_obj ON o.creator_id = c_obj.id -- Join the creator of obj
  JOIN
    obj_type ot ON ot.id = $2               -- obj_type_id parameter
  JOIN
    creator c_ot ON ot.creator_id = c_ot.id -- Join the creator of obj_type
  WHERE
    c_obj.org_id = c_ot.org_id              -- Ensure both creators belong to the same org
    AND o.id = $1                           -- obj_id parameter
)
INSERT INTO obj_type_value (obj_id, type_id, type_values)
SELECT $1, $2, $3::jsonb
FROM
  org_check
RETURNING *;

-- name: RemoveObjectTypeValue :exec
DELETE FROM obj_type_value
WHERE obj_type_value.id = $1
AND EXISTS (
    SELECT 1 FROM obj o
    JOIN creator c ON o.creator_id = c.id
    WHERE o.id = obj_type_value.obj_id AND c.org_id = $2
);

-- name: UpdateObjectTypeValue :one
UPDATE obj_type_value
SET type_values = $3::jsonb
WHERE obj_type_value.id = $1
  AND EXISTS (
    SELECT 1 FROM obj o
    JOIN creator c ON o.creator_id = c.id
    WHERE o.id = obj_type_value.obj_id AND c.org_id = $2
  )
RETURNING *;

-- name: CreateObjStep :one
WITH existing_step AS (
    -- First check if the step already exists
    SELECT * FROM obj_step
    WHERE obj_step.obj_id = $1 AND obj_step.step_id = $2 AND obj_step.deleted_at IS NULL
),
new_step AS (
    -- Try to insert if it doesn't exist
    INSERT INTO obj_step (obj_id, step_id, creator_id)
    SELECT $1, $2, $3
    WHERE NOT EXISTS (SELECT 1 FROM existing_step)
    RETURNING *
),
update_old_steps AS (
    -- Update other steps in the same funnel
    UPDATE obj_step
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE obj_id = $1
      AND step_id IN (
        SELECT id
        FROM step
        WHERE funnel_id = (SELECT funnel_id FROM step WHERE id = $2)
      )
      AND step_id != $2
      AND deleted_at IS NULL
),
combined_result AS (
    -- Combine both existing and new steps
    SELECT * FROM existing_step
    UNION ALL
    SELECT * FROM new_step
)
SELECT * FROM combined_result 
LIMIT 1; -- Ensure we only get one row

-- name: SoftDeleteObjStep :exec
UPDATE obj_step
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL;

-- name: HardDeleteObjStep :exec
DELETE FROM obj_step
WHERE id = $1;

-- name: GetObjStep :one
SELECT * FROM obj_step
WHERE id = $1;

-- name: UpdateObjStepSubStatus :exec
UPDATE obj_step
SET sub_status = $2
WHERE id = $1 AND deleted_at IS NULL;

-- Existing queries...

-- name: CreateTask :one
INSERT INTO task (content, deadline, remind_at, status, creator_id, assigned_id, parent_id)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: UpdateTask :one
UPDATE task
SET content = $2,
    deadline = $3,
    remind_at = $4,
    status = $5,
    assigned_id = $6,
    parent_id = $7,
    last_updated = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: DeleteTask :exec
UPDATE task
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL;

-- name: ListTasksByOrgID :many
SELECT t.*, c.username as creator_name, a.username as assigned_name
FROM task t
JOIN creator c ON t.creator_id = c.id
LEFT JOIN creator a ON t.assigned_id = a.id
WHERE c.org_id = $1 AND t.deleted_at IS NULL
  AND ($2::text = '' OR (
    t.content ILIKE '%' || $2 || '%' OR
    c.username ILIKE '%' || $2 || '%' OR
    a.username ILIKE '%' || $2 || '%'
  ))
ORDER BY t.last_updated DESC
LIMIT $3 OFFSET $4;

-- name: CountTasksByOrgID :one
SELECT COUNT(*)
FROM task t
JOIN creator c ON t.creator_id = c.id
LEFT JOIN creator a ON t.assigned_id = a.id
WHERE c.org_id = $1 AND t.deleted_at IS NULL
  AND ($2::text = '' OR (
    t.content ILIKE '%' || $2 || '%' OR
    c.username ILIKE '%' || $2 || '%' OR
    a.username ILIKE '%' || $2 || '%'
  ));

-- name: GetTaskByID :one
SELECT t.*, c.username as creator_name, a.username as assigned_name
FROM task t
JOIN creator c ON t.creator_id = c.id
LEFT JOIN creator a ON t.assigned_id = a.id
WHERE t.id = $1 AND t.deleted_at IS NULL;

-- name: AddObjectsToTask :exec
INSERT INTO obj_task (obj_id, task_id)
SELECT unnest($1::uuid[]), $2
WHERE EXISTS (
  SELECT 1 FROM task t
  JOIN creator c ON t.creator_id = c.id
  WHERE t.id = $2 AND c.org_id = $3
)
AND NOT EXISTS (
  SELECT 1 FROM obj_task
  WHERE obj_id = ANY($1::uuid[]) AND task_id = $2
);

-- name: RemoveObjectsFromTask :exec
DELETE FROM obj_task
WHERE task_id = $1 AND obj_id = ANY($2::uuid[]);

-- name: ListObjectsByTaskID :many
SELECT o.id, o.name, o.description
FROM obj o
JOIN obj_task ot ON o.id = ot.obj_id
WHERE ot.task_id = $1;

-- name: ListTasksByObjectID :many
SELECT 
    t.id,
    t.content,
    t.deadline,
    t.remind_at,
    t.status,
    t.creator_id,
    c.username AS creator_name,
    t.assigned_id,
    a.username AS assigned_name,
    t.parent_id,
    t.created_at,
    t.last_updated,
    COALESCE(
        json_agg(
            json_build_object(
                'id', o.id,
                'name', o.name,
                'description', o.description
            )
        ) FILTER (WHERE o.id IS NOT NULL),
        '[]'
    ) AS objects
FROM 
    task t
JOIN 
    creator c ON t.creator_id = c.id
LEFT JOIN 
    creator a ON t.assigned_id = a.id
JOIN 
    obj_task ot ON t.id = ot.task_id
LEFT JOIN 
    obj o ON ot.obj_id = o.id
WHERE 
    o.id = $1 
    AND t.deleted_at IS NULL
    AND ($2::text = '' OR (
        t.content ILIKE '%' || $2 || '%' OR
        c.username ILIKE '%' || $2 || '%' OR
        a.username ILIKE '%' || $2 || '%'
    ))
GROUP BY 
    t.id, c.username, a.username
ORDER BY 
    t.created_at DESC
LIMIT $3 OFFSET $4;

-- name: CountTasksByObjectID :one
SELECT COUNT(DISTINCT t.id)
FROM 
    task t
JOIN 
    obj_task ot ON t.id = ot.task_id
WHERE 
    ot.obj_id = $1 
    AND t.deleted_at IS NULL
    AND ($2::text = '' OR (
        t.content ILIKE '%' || $2 || '%' OR
        EXISTS (
            SELECT 1 FROM creator c 
            WHERE c.id = t.creator_id AND c.username ILIKE '%' || $2 || '%'
        ) OR
        EXISTS (
            SELECT 1 FROM creator a 
            WHERE a.id = t.assigned_id AND a.username ILIKE '%' || $2 || '%'
        )
    ));

-- Add this new query to your existing queries.sql file

-- name: ListTasksWithFilter :many
SELECT 
    t.id,
    t.content,
    t.deadline,
    t.remind_at,
    t.status,
    t.creator_id,
    c.username AS creator_name,
    t.assigned_id,
    a.username AS assigned_name,
    t.parent_id,
    t.created_at,
    t.last_updated,
    COALESCE(
        json_agg(
            json_build_object(
                'id', o.id,
                'name', o.name,
                'description', o.description
            )
        ) FILTER (WHERE o.id IS NOT NULL),
        '[]'
    ) AS objects
FROM 
    task t
JOIN 
    creator c ON t.creator_id = c.id
LEFT JOIN 
    creator a ON t.assigned_id = a.id
LEFT JOIN 
    obj_task ot ON t.id = ot.task_id
LEFT JOIN 
    obj o ON ot.obj_id = o.id
WHERE 
    t.deleted_at IS NULL
    AND ((
      CASE 
        WHEN $1::uuid IS NOT NULL THEN 
          t.creator_id = $1
        ELSE 
          TRUE
      END
    )
    OR (
      CASE 
        WHEN $2::uuid IS NOT NULL THEN 
          t.assigned_id = $2
        ELSE 
          TRUE
      END
    ))
    AND (
      CASE 
        WHEN $3::text != '' THEN 
          (t.content ILIKE '%' || $3 || '%')
        ELSE 
          TRUE
      END
    )
    AND (
      CASE 
        WHEN $4::text != '' THEN
          t.status = ANY(string_to_array($4::text, ','))
        ELSE
          TRUE
      END
    )
GROUP BY 
    t.id, c.username, a.username
ORDER BY 
    t.last_updated DESC
LIMIT $5 OFFSET $6;

-- name: CountTasksWithFilter :one
SELECT COUNT(DISTINCT t.id)
FROM 
    task t
WHERE 
    t.deleted_at IS NULL
    AND ((
      CASE 
        WHEN $1::uuid IS NOT NULL THEN 
          t.creator_id = $1
        ELSE 
          TRUE
        END
    )
    OR (
      CASE 
        WHEN $2::uuid IS NOT NULL THEN 
          t.assigned_id = $2
        ELSE 
          TRUE
      END
    ))
    AND (
      CASE 
        WHEN $3::text != '' THEN 
          (t.content ILIKE '%' || $3 || '%')
        ELSE 
          TRUE
      END
    )
    AND (
      CASE 
        WHEN $4::text != '' THEN
          t.status = ANY(string_to_array($4::text, ','))
        ELSE
          TRUE
      END
    );

-- name: ListOrgMembers :many
WITH filtered_creators AS (
    SELECT c.id, c.username, c.profile, c.role, c.active, c.created_at,
           to_tsvector('english', c.username) || 
           to_tsvector('english', coalesce(c.profile::text, '')) as document
    FROM creator c
    WHERE c.org_id = $1 AND c.deleted_at IS NULL
)
SELECT id, username, profile, role, active, created_at
FROM filtered_creators
WHERE $2::text = '' OR 
      document @@ plainto_tsquery('english', $2::text) OR
      profile::text ILIKE '%' || $2::text || '%'
ORDER BY created_at DESC;

-- name: GetOrgDetails :one
SELECT * FROM org WHERE id = $1;

-- name: UpdateOrgDetails :one
UPDATE org
SET name = $2, profile = $3
WHERE id = $1
RETURNING *;

-- name: UpdateUserRoleAndStatus :one
UPDATE creator
SET role = $2, active = $3
WHERE id = $1 AND org_id = $4
RETURNING *;

-- name: UpdateUserPassword :exec
UPDATE creator
SET pwd = $2
WHERE id = $1;

-- name: UpdateUserProfile :one
UPDATE creator
SET profile = $2
WHERE id = $1
RETURNING *;

-- name: CountUnseenFeed :one
SELECT COUNT(*) c FROM feed
WHERE creator_id = $1 AND seen = false;

-- name: CountOngoingTask :one
SELECT COUNT(*) c FROM task
WHERE deleted_at IS NULL AND ( assigned_id = $1 
OR creator_id = $1 )
AND status in ('todo', 'doing');

-- Add these new queries to your existing queries.sql file

-- name: CreateFact :one
INSERT INTO fact (text, happened_at, location, creator_id)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdateFact :one
UPDATE fact
SET text = $2, happened_at = $3, location = $4
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: DeleteFact :exec
UPDATE fact
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetFactByID :one
SELECT f.*, c.username as creator_name
FROM fact f
JOIN creator c ON f.creator_id = c.id
WHERE f.id = $1 AND f.deleted_at IS NULL;

-- name: ListFactsByOrgID :many
SELECT 
    f.id,
    f.text,
    f.happened_at,
    f.location,
    f.creator_id,
    c.username AS creator_name,
    f.created_at,
    COALESCE(
        json_agg(
            json_build_object(
                'id', o.id,
                'name', o.name,
                'description', o.description
            )
        ) FILTER (WHERE o.id IS NOT NULL),
        '[]'
    ) AS related_objects
FROM 
    fact f
JOIN 
    creator c ON f.creator_id = c.id
LEFT JOIN 
    obj_fact of ON f.id = of.fact_id
LEFT JOIN 
    obj o ON of.obj_id = o.id
WHERE 
    c.org_id = $1 
    AND f.deleted_at IS NULL
    AND ($2::text = '' OR f.text ILIKE '%' || $2 || '%')
GROUP BY 
    f.id, c.username
ORDER BY 
    f.happened_at DESC
LIMIT $3 OFFSET $4;

-- name: CountFactsByOrgID :one
SELECT COUNT(DISTINCT f.id)
FROM 
    fact f
JOIN 
    creator c ON f.creator_id = c.id
WHERE 
    c.org_id = $1 
    AND f.deleted_at IS NULL
    AND ($2::text = '' OR f.text ILIKE '%' || $2 || '%');

-- name: AddObjectsToFact :exec
INSERT INTO obj_fact (obj_id, fact_id)
SELECT unnest($1::uuid[]), $2
WHERE EXISTS (
  SELECT 1 FROM fact f
  JOIN creator c ON f.creator_id = c.id
  WHERE f.id = $2 AND c.org_id = $3
)
AND NOT EXISTS (
  SELECT 1 FROM obj_fact
  WHERE obj_id = ANY($1::uuid[]) AND fact_id = $2
);

-- name: RemoveObjectsFromFact :exec
DELETE FROM obj_fact
WHERE fact_id = $1 AND obj_id = ANY($2::uuid[]);

-- name: GetObjectsForStep :many
SELECT o.id, o.name, o.description,
       coalesce(json_agg(json_build_object('id', t.id, 'name', t.name, 'color_schema', t.color_schema)) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
FROM obj o
JOIN obj_step os ON o.id = os.obj_id
LEFT JOIN obj_tag ot ON o.id = ot.obj_id
LEFT JOIN tag t ON ot.tag_id = t.id
WHERE os.step_id = $1 AND os.deleted_at IS NULL
  AND ($2::text = '' OR o.name ILIKE '%' || $2 || '%' OR o.description ILIKE '%' || $2 || '%')
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT $3 OFFSET $4;

-- name: CountObjectsForStep :one
SELECT COUNT(DISTINCT o.id)
FROM obj o
JOIN obj_step os ON o.id = os.obj_id
WHERE os.step_id = $1 AND os.deleted_at IS NULL
  AND ($2::text = '' OR o.name ILIKE '%' || $2 || '%' OR o.description ILIKE '%' || $2 || '%');