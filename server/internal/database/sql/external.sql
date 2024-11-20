-- name: FindObjectByAliasOrIDString :one
SELECT obj.* FROM obj
JOIN creator c ON o.creator_id = c.id
WHERE c.org_id = $2 AND 
id_string = $1 OR $1 = ANY(aliases)
AND deleted_at IS NULL
ORDER BY (id_string = $1) DESC
LIMIT 1;
