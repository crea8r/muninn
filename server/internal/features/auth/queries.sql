-- name: GetCreatorByUsername :one
SELECT c.*, o.name as orgName FROM creator c
JOIN org o ON c.org_id = o.id
WHERE username = $1 AND active = $2;

-- name: UpdateCreatorPassword :exec
UPDATE creator
SET pwd = $2
WHERE id = $1;

-- name: UpdateCreatorProfile :one
UPDATE creator
SET profile = $2
WHERE id = $1
RETURNING *;

-- name: UpdateCreatorRoleAndStatus :one
UPDATE creator
SET role = $2, active = $3
WHERE id = $1 AND org_id = $4
RETURNING *;

-- name: GetOrgDetails :one
SELECT * FROM org WHERE id = $1;

-- name: UpdateOrgDetails :one
UPDATE org
SET name = $2, profile = $3
WHERE id = $1
RETURNING *;

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
