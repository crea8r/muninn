-- name: CreateAutomatedAction :one
INSERT INTO automated_action (
  org_id, name, description, filter_config, 
  action_config, created_by
) VALUES (
  $1, $2, $3, $4, $5, $6
)
RETURNING *;

-- name: UpdateAutomatedAction :one
UPDATE automated_action
SET name = $2,
  description = $3,
  filter_config = $4,
  action_config = $5,
  is_active = $6
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: DeleteAutomatedAction :exec
UPDATE automated_action
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: GetPendingActions :many
SELECT * FROM automated_action
WHERE is_active = true 
AND deleted_at IS NULL
AND (
  last_run_at IS NULL 
  OR last_run_at < CURRENT_TIMESTAMP - INTERVAL '10 minutes'
)
ORDER BY last_run_at NULLS FIRST;

-- name: UpdateActionLastRun :exec
UPDATE automated_action
SET last_run_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: CreateActionExecution :one
INSERT INTO automated_action_execution (
  action_id, status
) VALUES (
  $1, 'running'
)
RETURNING *;

-- name: UpdateActionExecution :one
UPDATE automated_action_execution
SET status = $2,
  completed_at = CURRENT_TIMESTAMP,
  objects_processed = $3,
  objects_affected = $4,
  error_message = $5,
  execution_log = $6
WHERE id = $1
RETURNING *;

-- name: ListAutomatedActions :many
SELECT * FROM automated_action 
WHERE org_id = $1 
  AND deleted_at IS NULL 
  AND ($2 = '' OR name ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%')
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: CountAutomatedActions :one
SELECT COUNT(*) FROM automated_action 
WHERE org_id = $1 
  AND deleted_at IS NULL
  AND ($2 = '' OR name ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%');

-- name: GetAutomatedAction :one
SELECT * FROM automated_action 
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetLatestExecution :one
SELECT * FROM automated_action_execution
WHERE action_id = $1
ORDER BY started_at DESC
LIMIT 1;

-- name: ListActionExecutions :many
SELECT * FROM automated_action_execution
WHERE action_id = $1
ORDER BY started_at DESC
LIMIT $2 OFFSET $3;

-- name: CountActionExecutions :one
SELECT COUNT(*) FROM automated_action_execution
WHERE action_id = $1;

-- name: AddObjectToFirstStep :one
WITH first_step AS (
    -- Get the first step (lowest step_order) of the specified funnel
    SELECT id
    FROM step
    WHERE step.funnel_id = $1
      AND deleted_at IS NULL
    ORDER BY step_order ASC
    LIMIT 1
),
existing_step AS (
    -- Check if object is already in any step of this funnel
    SELECT os.id
    FROM obj_step os
    JOIN step s ON os.step_id = s.id
    WHERE os.obj_id = $2
      AND s.funnel_id = $1
      AND os.deleted_at IS NULL
),
new_step AS (
    -- Insert into obj_step only if object isn't already in the funnel
    INSERT INTO obj_step (
        obj_id,
        step_id,
        creator_id,
        sub_status,
        created_at,
        last_updated
    )
    SELECT
        $2,                    -- obj_id
        fs.id,                 -- step_id from first_step
        $3,                    -- creator_id
        0,                     -- default sub_status
        CURRENT_TIMESTAMP,     -- created_at
        CURRENT_TIMESTAMP      -- last_updated
    FROM first_step fs
    WHERE NOT EXISTS (SELECT 1 FROM existing_step)
    RETURNING *
)
SELECT 
    ns.*,
    s.funnel_id,
    s.name as step_name,
    f.name as funnel_name
FROM new_step ns
JOIN step s ON ns.step_id = s.id
JOIN funnel f ON s.funnel_id = f.id;