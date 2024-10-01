-- name: ListObjectsByTypeWithAdvancedFilter :many
WITH object_data AS (
    SELECT DISTINCT ON (o.id)
        o.id, o.name, o.description, o.created_at,
        otv.type_values,
        ot.fields AS type_fields,
        array_agg(t.id) AS tag_ids
    FROM obj o
    JOIN obj_type_value otv ON o.id = otv.obj_id
    JOIN obj_type ot ON otv.type_id = ot.id
    JOIN creator c ON o.creator_id = c.id
    LEFT JOIN obj_tag ot_tag ON o.id = ot_tag.obj_id
    LEFT JOIN tag t ON ot_tag.tag_id = t.id
    WHERE otv.type_id = $1 AND o.deleted_at IS NULL AND c.org_id = $2
    GROUP BY o.id, o.name, o.description, o.created_at, otv.type_values, ot.fields
)
SELECT 
    od.id, od.name, od.description, od.created_at,
    coalesce(json_agg(json_build_object(
        'id', t.id,
        'name', t.name,
        'color_schema', t.color_schema
    )) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags,
    od.type_values as type_values
FROM object_data od
LEFT JOIN tag t ON t.id = ANY(od.tag_ids)
WHERE 
    ($3::jsonb IS NULL OR od.type_values @> $3) -- Advanced filter for obj_type_value fields
    AND (array_length($4::uuid[],1) IS NULL OR t.id = ANY($4::uuid[])) -- Filter by tags
    AND ($5::text = '' OR 
         to_tsvector('english', od.name || ' ' || od.description || ' ' || 
             coalesce(od.type_values::text, '')) @@ plainto_tsquery('english', $5))
GROUP BY od.id, od.name, od.description, od.created_at, od.type_values
ORDER BY 
    CASE WHEN $6 = 'asc' THEN od.created_at END ASC,
    CASE WHEN $6 = 'desc' OR $6 = '' THEN od.created_at END DESC
LIMIT $7 OFFSET $8;

-- name: CountObjectsByTypeWithAdvancedFilter :one
SELECT COUNT(DISTINCT o.id)
FROM obj o
JOIN obj_type_value otv ON o.id = otv.obj_id
JOIN obj_type ot ON otv.type_id = ot.id
JOIN creator c ON o.creator_id = c.id
LEFT JOIN obj_tag ot_tag ON o.id = ot_tag.obj_id
LEFT JOIN tag t ON ot_tag.tag_id = t.id
WHERE otv.type_id = $1 AND o.deleted_at IS NULL AND c.org_id = $2
  AND ($3::jsonb IS NULL OR otv.type_values @> $3)
  AND (array_length($4::uuid[],1) IS NULL OR t.id = ANY($4::uuid[]))
  AND ($5::text = '' OR 
       to_tsvector('english', o.name || ' ' || o.description || ' ' || 
           coalesce(otv.type_values::text, '')) @@ plainto_tsquery('english', $5));