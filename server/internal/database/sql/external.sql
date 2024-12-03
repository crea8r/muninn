-- name: FindObjectByAliasOrIDString :one
SELECT obj.* FROM obj
JOIN creator c ON o.creator_id = c.id
WHERE c.org_id = $2 AND 
id_string = $1 OR $1 = ANY(aliases)
AND deleted_at IS NULL
ORDER BY (id_string = $1) DESC
LIMIT 1;

-- name: FindTagByNormalizedName :one
SELECT * FROM tag 
WHERE lower(name) = lower($1) 
AND org_id = $2
AND deleted_at IS NULL
LIMIT 1;

-- name: ListObjectsWithNormalizedData :many
-- Main query to transform and aggregate object data
WITH valid_keys AS (
    SELECT unnest(ARRAY[
        'name', 'email', 'phone', 'x or twitter', 'twitter',
        'company', 'linkedin', 'telegram', 'discord', 'institution', 'web'
    ]) AS key_name
),
-- First level: Get all keys for each object
raw_values AS (
  SELECT 
    o.id,
    o.name AS object_name,
    o.created_at,
    k2.key_name as original_key,
    CASE 
      WHEN k.key_name IN ('twitter', 'x or twitter') THEN 
        clean_url_value(otv.type_values->k2.key_name::text, 'twitter')
      WHEN k.key_name = 'web' THEN 
        clean_url_value(otv.type_values->k2.key_name::text, 'web')
      WHEN k.key_name = 'linkedin' THEN 
        clean_url_value(otv.type_values->k2.key_name::text, 'linkedin')
      WHEN k.key_name IS NULL THEN
        regexp_replace(lower(otv.type_values->>k2.key_name::text), '["''*:]', ' ', 'g')
      ELSE 
        lower(otv.type_values->>k2.key_name::text)
    END AS cleaned_value,
    CASE 
      WHEN k.key_name IS NOT NULL THEN 
        'contact.' || k.key_name
      ELSE 
        'other'
    END AS transformed_key
  FROM obj o
  LEFT JOIN obj_type_value otv ON o.id = otv.obj_id
  -- Get keys from type_values using jsonb_object_keys
  LEFT JOIN LATERAL (
    SELECT jsonb_object_keys(otv.type_values) as key_name
  ) k2 ON true
  LEFT JOIN valid_keys k ON k.key_name = k2.key_name
  LEFT JOIN creator c ON o.creator_id = c.id
  LEFT JOIN org org ON c.org_id = org.id
  WHERE o.deleted_at IS NULL
    AND otv.deleted_at IS NULL
    AND org.id = $1
    AND ($2::TIMESTAMP IS NULL OR o.created_at > $2::TIMESTAMP)
    AND (
      $3::uuid[] IS NULL OR o.id = ANY($3::uuid[])
    )
),
-- Second level: Aggregate values by key
aggregated_values AS (
  SELECT 
    id,
    object_name,
    created_at,
    transformed_key,
    CASE 
      WHEN transformed_key = 'other' THEN 
        string_agg(cleaned_value, ' ')
      ELSE 
        string_agg(DISTINCT cleaned_value, ', ')
    END AS combined_value
  FROM raw_values
  WHERE cleaned_value IS NOT NULL AND cleaned_value != ''
  GROUP BY id, object_name, created_at, transformed_key
),
-- Third level: Create contact data object
contact_data AS (
  SELECT 
    id,
    object_name,
    created_at,
    jsonb_object_agg(
      transformed_key,
      combined_value
    ) AS contact_data
  FROM aggregated_values
  GROUP BY id, object_name, created_at
)
SELECT 
  cd.id,
  cd.object_name,
  cd.created_at,
  cd.contact_data as contact_data
FROM contact_data cd
ORDER BY cd.created_at DESC
LIMIT 100;

-- name: CountObjectsAfterCreatedAt :one
SELECT COUNT(DISTINCT o.id)
FROM obj o
JOIN obj_type_value otv ON o.id = otv.obj_id
WHERE o.created_at > $1
  AND o.deleted_at IS NULL
  AND otv.deleted_at IS NULL;