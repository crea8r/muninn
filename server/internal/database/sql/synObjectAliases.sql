-- name: SyncObjectAliases :one
WITH matched_rows AS (
  SELECT 
    obj.id, 
    id_string, 
    aliases,
    (ARRAY(
      SELECT unnest($1::text[]) 
      EXCEPT 
      SELECT unnest(aliases || ARRAY[id_string])
    )) AS new_aliases_to_add,
    CASE WHEN id_string = ANY($1::text[]) THEN TRUE ELSE FALSE END AS has_id_string_match
  FROM obj
  JOIN creator c ON obj.creator_id = c.id
  WHERE c.org_id = $2
  AND id_string = ANY($1::text[]) OR aliases && $1::text[]
),
updated_rows AS (
  SELECT 
    id, 
    id_string, 
    aliases || new_aliases_to_add AS updated_aliases,
    has_id_string_match
  FROM matched_rows
  ORDER BY has_id_string_match DESC, id -- Prioritize rows with id_string match
  LIMIT 1
),
update_result AS (
  UPDATE obj
  SET aliases = u.updated_aliases
  FROM updated_rows u
  WHERE obj.id = u.id
  RETURNING obj.id, obj.id_string, obj.aliases
)
SELECT * FROM update_result;