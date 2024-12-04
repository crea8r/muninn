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
  objects_affected = $3,
  error_message = $4,
  execution_log = $5
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

-- name: DeleteActionOldExecutions :exec
DELETE FROM automated_action_execution
WHERE started_at < $1;