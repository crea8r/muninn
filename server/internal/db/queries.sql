-- name: GetObject :one
SELECT * FROM obj WHERE id = $1 AND deleted_at IS NULL;

-- name: ListObjects :many
SELECT * FROM obj WHERE creator_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3;

-- name: CreateObject :one
INSERT INTO obj (name, description, id_string, creator_id) VALUES ($1, $2, $3, $4) RETURNING *;

-- name: UpdateObject :one
UPDATE obj SET name = $2, description = $3, id_string = $4 WHERE id = $1 AND deleted_at IS NULL RETURNING *;

-- name: DeleteObject :exec
UPDATE obj SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL;

-- name: GetFunnel :one
SELECT * FROM funnel WHERE id = $1 AND deleted_at IS NULL;

-- name: ListFunnels :many
SELECT * FROM funnel WHERE creator_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3;

-- name: CreateFunnel :one
INSERT INTO funnel (name, description, creator_id) VALUES ($1, $2, $3) RETURNING *;

-- name: UpdateFunnel :one
UPDATE funnel SET name = $2, description = $3 WHERE id = $1 AND deleted_at IS NULL RETURNING *;

-- name: DeleteFunnel :exec
UPDATE funnel SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL;

-- name: GetCreator :one
SELECT * FROM creator WHERE id = $1 AND deleted_at IS NULL;

-- name: ListCreators :many
SELECT * FROM creator WHERE org_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3;

-- name: CreateCreator :one
INSERT INTO creator (username, pwd, profile, role, org_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: UpdateCreator :one
UPDATE creator SET username = $2, profile = $3, role = $4 WHERE id = $1 AND deleted_at IS NULL RETURNING *;

-- name: DeleteCreator :exec
UPDATE creator SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL;