-- name: CreateList :one
INSERT INTO list (name, description, filter_setting, creator_id)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: CreateCreatorList :one
INSERT INTO creator_list (creator_id, list_id, params)
VALUES ($1, $2, '{}')
RETURNING *;

-- name: UpdateList :one
UPDATE list
SET name = $2, description = $3, filter_setting = $4, last_updated = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: DeleteList :exec
DELETE FROM list
WHERE list.id = $1
AND NOT EXISTS (
  SELECT 1
  FROM creator_list
  WHERE creator_list.list_id = $1
);

-- name: GetListByID :one
SELECT l.id
FROM list l
WHERE l.id = $1 AND l.deleted_at IS NULL;

-- name: UpdateCreatorList :one
UPDATE creator_list
SET params = $2, last_updated = CURRENT_TIMESTAMP
WHERE id=$1
RETURNING *;

-- name: DeleteCreatorList :exec
DELETE FROM creator_list
WHERE id=$1;

-- name: ListListsByOrgID :many
SELECT l.*, c.username as creator_name
FROM list l
JOIN creator c ON l.creator_id = c.id
WHERE c.org_id = $1 AND l.deleted_at IS NULL
ORDER BY l.last_updated DESC
LIMIT $2 OFFSET $3;

-- name: CountListsByOrgID :one
SELECT COUNT(*)
FROM list l
JOIN creator c ON l.creator_id = c.id
WHERE c.org_id = $1 AND l.deleted_at IS NULL;

-- name: ListCreatorListsByCreatorID :many
SELECT cl.*, l.name as list_name, l.description as list_description, l.filter_setting as list_filter_setting
FROM creator_list cl
JOIN list l ON cl.list_id = l.id
WHERE cl.creator_id = $1 AND l.deleted_at IS NULL
ORDER BY cl.last_updated DESC;

-- name: GetCreatorListByID :one
SELECT cl.*, l.name as list_name, l.description as list_description, l.filter_setting as list_filter_setting
FROM creator_list cl
JOIN list l ON cl.list_id = l.id
WHERE cl.id = $1 AND l.deleted_at IS NULL;