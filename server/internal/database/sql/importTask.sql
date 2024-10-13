-- name: GetOngoingImportTask :one
SELECT * FROM import_task
WHERE org_id = $1 AND status IN ('pending', 'processing')
ORDER BY created_at DESC
LIMIT 1;

-- name: CreateImportTask :one
INSERT INTO import_task (
    org_id, creator_id, obj_type_id, status, total_rows, file_name
) VALUES (
    $1, $2, $3, $4, $5, $6
)
RETURNING *;

-- name: UpdateImportTaskStatus :one
UPDATE import_task
SET status = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: UpdateImportTaskProgress :one
UPDATE import_task
SET progress = $2, processed_rows = $3, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: CompleteImportTask :one
UPDATE import_task
SET status = $2, result_summary = $3, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: UpdateImportTaskError :one
UPDATE import_task
SET status = $2, error_message = $3, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: GetImportTask :one
SELECT * FROM import_task
WHERE id = $1;

-- name: GetImportTaskHistory :many
SELECT * FROM import_task
WHERE org_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountImportTasks :one
SELECT COUNT(*) FROM import_task
WHERE org_id = $1;

-- name: GetObjectByIDString :one
SELECT * FROM obj
WHERE id_string = $1
LIMIT 1;

-- name: UpsertObjectTypeValue :one
INSERT INTO obj_type_value (obj_id, type_id, type_values)
VALUES ($1, $2, $3)
ON CONFLICT (obj_id, type_id) 
DO UPDATE SET type_values = EXCLUDED.type_values
RETURNING *;