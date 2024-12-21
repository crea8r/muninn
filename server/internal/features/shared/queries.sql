-- name: GetCreatorByID :one
SELECT id, username, pwd, profile, role, org_id, active, created_at, deleted_at FROM creator WHERE id = $1 LIMIT 1;

-- name: CreateCreator :one
INSERT INTO creator (username, pwd, profile, role, org_id, active, created_at)
VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
RETURNING *;

-- name: DeleteCreator :exec
UPDATE creator SET deleted_at = NOW() WHERE id = $1;