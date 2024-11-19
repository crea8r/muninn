-- name: FindObjectByAliasOrIDString :one
SELECT o.* FROM obj o
JOIN creator c ON o.creator_id = c.id
WHERE c.org_id = $3 
AND o.deleted_at IS NULL
AND (o.id_string = $1 OR $2 = ANY(o.aliases));
