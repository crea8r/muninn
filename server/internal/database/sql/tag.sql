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

-- name: GetTagsByIDs :many
SELECT * FROM tag
WHERE id = ANY($1::uuid[]) AND deleted_at IS NULL;

-- name: CountTags :one
SELECT COUNT(*) 
FROM tag
WHERE org_id = $1
  AND deleted_at IS NULL
  AND ($2::text = '' OR (name ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%'));