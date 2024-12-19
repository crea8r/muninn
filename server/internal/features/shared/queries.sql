-- name: GetCreatorByID :one
SELECT * FROM creator WHERE id = $1 LIMIT 1;