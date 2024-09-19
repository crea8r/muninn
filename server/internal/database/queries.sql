-- name: GetCreator :one
SELECT * FROM creator WHERE id = $1 LIMIT 1;

-- name: GetCreatorByUsername :one
SELECT * FROM creator
WHERE username = $1 AND active = $2;

-- name: ListCreators :many
SELECT * FROM creator
WHERE org_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: CreateCreator :one
INSERT INTO creator (username, pwd, profile, role, org_id, active, created_at)
VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
RETURNING *;

-- name: UpdateCreator :one
UPDATE creator
SET username = $2, profile = $3, role = $4
WHERE id = $1
RETURNING *;

-- name: DeleteCreator :exec
UPDATE creator SET deleted_at = NOW() WHERE id = $1;

-- name: GetSessionByToken :one
SELECT * FROM creator_session WHERE jwt = $1 LIMIT 1;

-- name: GetCreatorByID :one
SELECT * FROM creator WHERE id = $1 LIMIT 1;

-- name: CreateFeed :one
INSERT INTO feed (creator_id, content, seen)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetFeed :many
SELECT * FROM feed
WHERE creator_id = $1 AND seen = false
ORDER BY created_at DESC;

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
INSERT INTO obj_type (name, description, fields, creator_id)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdateObjectType :one
UPDATE obj_type
SET name = $2, description = $3, fields = $4
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
SELECT o.id, o.name, o.description, o.fields, o.created_at
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
  );

-- name: CreateStep :one
INSERT INTO step (id, funnel_id, name, definition, example, action, step_order)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetStep :one
SELECT s.*, 
       (SELECT COUNT(*) FROM obj_step os WHERE os.step_id = s.id) AS object_count
FROM step s
WHERE s.id = $1 AND s.deleted_at IS NULL;

-- name: UpdateStep :one
UPDATE step
SET name = $2, definition = $3, example = $4, action = $5, step_order = $6, last_updated = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: DeleteStep :exec
UPDATE step
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
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

-- name: ListObjectsByOrgID :many
WITH object_data AS (
    SELECT o.id, o.name, o.description, o.id_string, o.creator_id,
           o.created_at, o.deleted_at,
           to_tsvector('english', o.name || ' ' || o.description || ' ' || o.id_string) AS obj_search,
           array_agg(DISTINCT t.id) AS tag_ids,
           array_agg(DISTINCT otv.id) AS type_value_ids,
           string_agg(DISTINCT otv.search_vector::text, ' ')::tsvector AS type_search,
           string_agg(DISTINCT f.text, ' ')::tsvector AS fact_search
    FROM obj o
    JOIN creator c ON o.creator_id = c.id
    LEFT JOIN obj_tag ot ON o.id = ot.obj_id
    LEFT JOIN tag t ON ot.tag_id = t.id
    LEFT JOIN obj_type_value otv ON o.id = otv.obj_id
    LEFT JOIN obj_fact of ON o.id = of.obj_id
    LEFT JOIN fact f ON of.fact_id = f.id
    WHERE c.org_id = $1 AND o.deleted_at IS NULL
    GROUP BY o.id
)
SELECT od.id, od.name, od.description, od.id_string, od.created_at,
       coalesce((SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'color_schema', t.color_schema))
        FROM tag t
        WHERE t.id = ANY(od.tag_ids)),'[]') AS tags,
       coalesce((SELECT jsonb_agg(jsonb_build_object('id', otv.id, 'objectTypeId', otv.type_id, 'type_values', otv.type_values))
        FROM obj_type_value otv
        WHERE otv.id = ANY(od.type_value_ids)),'[]') AS type_values
FROM object_data od
WHERE ($2 = '' OR
      od.obj_search @@ to_tsquery('english', $2) OR
      od.fact_search @@ to_tsquery('english', $2) OR
      od.type_search @@ to_tsquery('english', $2)
      )
ORDER BY od.created_at DESC
LIMIT $3 OFFSET $4;

-- name: CountObjectsByOrgID :one
SELECT COUNT(DISTINCT o.id)
FROM obj o
JOIN creator c ON o.creator_id = c.id
LEFT JOIN obj_tag ot ON o.id = ot.obj_id
LEFT JOIN tag t ON ot.tag_id = t.id
LEFT JOIN obj_type_value otv ON o.id = otv.obj_id
LEFT JOIN obj_fact of ON o.id = of.obj_id
LEFT JOIN fact f ON of.fact_id = f.id
WHERE c.org_id = $1 AND o.deleted_at IS NULL
  AND ($2 = '' OR
       to_tsvector('english', o.name || ' ' || o.description || ' ' || o.id_string) @@ to_tsquery('english', $2) OR
       to_tsvector('english', f.text) @@ to_tsquery('english', $2) OR
       otv.search_vector @@ to_tsquery('english', $2));

-- name: GetObjectDetails :one
WITH object_data AS (
    SELECT o.id, o.name, o.description, o.id_string, o.creator_id, o.created_at,
           c.org_id,
           coalesce(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'color_schema', t.color_schema)) FILTER (WHERE t.id IS NOT NULL), '[]') 
           AS tags,
           coalesce(json_agg(DISTINCT jsonb_build_object(
               'id', otv.id,
               'objectTypeId', ot.id,
               'objectTypeName', ot.name,
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
               'assignedId', task.assigned_id
           )) FILTER (WHERE task.id IS NOT NULL), '[]')
           AS tasks,
           coalesce(json_agg(DISTINCT jsonb_build_object(
               'stepId', s.id,
               'stepName', s.name,
               'funnelId', f.id,
               'funnelName', f.name
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
INSERT INTO obj_type_value (obj_id, type_id, type_values)
SELECT $1, $2, $3::jsonb
FROM obj o
JOIN creator c ON o.creator_id = c.id
JOIN obj_type ot ON ot.creator_id = c.id
WHERE o.id = $1 AND ot.id = $2 AND c.org_id = $4
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