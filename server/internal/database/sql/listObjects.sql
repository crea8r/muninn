-- name: ListObjectsByOrgID :many
WITH object_data AS (
    -- First get all the searchable text and metadata for each object
    SELECT 
        o.id, 
        o.name,
        o.photo,
        o.description, 
        o.id_string, 
        o.creator_id,
        o.created_at, 
        o.deleted_at,
        -- Create separate tsvector fields for different search sources
        to_tsvector('english', o.name || ' ' || o.description || ' ' || o.id_string) AS obj_search,
        to_tsvector('english', string_agg(DISTINCT COALESCE(f.text, ''), ' ')) AS fact_search,
        -- Combine all obj_type_value search vectors into one
        (
            SELECT string_agg(otv.search_vector::text, ' ')::tsvector 
            FROM obj_type_value otv 
            WHERE otv.obj_id = o.id
        ) AS type_value_search,
        -- Store original text for highlighting
        o.name || ' ' || o.description || ' ' || o.id_string AS obj_text,
        string_agg(DISTINCT COALESCE(f.text, ''), ' ') AS fact_text,
        string_agg(DISTINCT COALESCE(otv.type_values::text, ''), ' ') AS type_value_text,
        -- Store IDs for later joins
        array_agg(DISTINCT t.id) AS tag_ids,
        array_agg(DISTINCT otv.id) AS type_value_ids
    FROM obj o
    JOIN creator c ON o.creator_id = c.id
    LEFT JOIN obj_tag ot ON o.id = ot.obj_id
    LEFT JOIN tag t ON ot.tag_id = t.id
    LEFT JOIN obj_type_value otv ON o.id = otv.obj_id
    LEFT JOIN obj_fact of ON o.id = of.obj_id
    LEFT JOIN fact f ON of.fact_id = f.id
    WHERE c.org_id = $1 AND o.deleted_at IS NULL
    GROUP BY o.id, o.name, o.photo, o.description, o.id_string, o.creator_id, o.created_at, o.deleted_at
),
ranked_results AS (
    -- Calculate search ranking and highlighting for each source
    SELECT 
        od.*,
        CASE WHEN $2 = '' THEN 0
             ELSE ts_rank(obj_search, websearch_to_tsquery('english', $2)) 
        END AS obj_rank,
        CASE WHEN $2 = '' THEN 0
             ELSE ts_rank(fact_search, websearch_to_tsquery('english', $2))
        END AS fact_rank,
        CASE WHEN $2 = '' THEN 0
             ELSE ts_rank(type_value_search, websearch_to_tsquery('english', $2))
        END AS type_value_rank,
        CASE WHEN $2 = '' THEN ''  -- Empty string instead of NULL
             ELSE ts_headline('english', od.obj_text, 
                  websearch_to_tsquery('english', $2),
                  'StartSel=<mark>, StopSel=</mark>, MaxFragments=2, MaxWords=10, MinWords=5')
        END AS obj_headline,
        CASE WHEN $2 = '' THEN ''  -- Empty string instead of NULL
             ELSE ts_headline('english', COALESCE(od.fact_text, ''),
                  websearch_to_tsquery('english', $2),
                  'StartSel=<mark>, StopSel=</mark>, MaxFragments=2, MaxWords=10, MinWords=5')
        END AS fact_headline,
        CASE WHEN $2 = '' THEN ''  -- Empty string instead of NULL
             ELSE ts_headline('english', COALESCE(od.type_value_text, ''),
                  websearch_to_tsquery('english', $2),
                  'StartSel=<mark>, StopSel=</mark>, MaxFragments=2, MaxWords=10, MinWords=5')
        END AS type_value_headline,
        CASE
            WHEN $2 = '' THEN 'no_search'  -- Default value instead of NULL
            WHEN obj_search @@ websearch_to_tsquery('english', $2) THEN 'object_content'
            WHEN type_value_search @@ websearch_to_tsquery('english', $2) THEN 'type_values'
            WHEN fact_search @@ websearch_to_tsquery('english', $2) THEN 'related_facts'
            ELSE 'type_values'
        END AS match_source,
        CASE WHEN $2 = '' THEN 0
             ELSE (ts_rank(obj_search, websearch_to_tsquery('english', $2)) * 3 + 
                ts_rank(type_value_search, websearch_to_tsquery('english', $2)) * 2 +
                ts_rank(fact_search, websearch_to_tsquery('english', $2)))
        END AS final_rank
    FROM object_data od
    WHERE $2 = '' OR
          obj_search @@ websearch_to_tsquery('english', $2) OR
          fact_search @@ websearch_to_tsquery('english', $2) OR
          type_value_search @@ websearch_to_tsquery('english', $2)
)
SELECT 
    rr.id, 
    rr.name, 
    rr.photo,
    rr.description, 
    rr.id_string, 
    rr.created_at,
    rr.match_source,
    rr.obj_headline,
    rr.fact_headline,
    rr.type_value_headline,
    rr.final_rank as search_rank,
    coalesce(
        (SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'color_schema', t.color_schema))
        FROM tag t
        WHERE t.id = ANY(rr.tag_ids)),
        '[]'
    ) AS tags,
    coalesce(
        (SELECT jsonb_agg(jsonb_build_object('id', otv.id, 'objectTypeId', otv.type_id, 'type_values', otv.type_values))
        FROM obj_type_value otv
        WHERE otv.id = ANY(rr.type_value_ids)),
        '[]'
    ) AS type_values
FROM ranked_results rr
ORDER BY 
    CASE WHEN $2 = '' THEN 0 ELSE rr.final_rank END DESC,
    rr.created_at DESC
LIMIT $3 OFFSET $4;

-- name: CountObjectsByOrgID :one
WITH objs AS (
    SELECT o.*, 
    (
        SELECT string_agg(otv.search_vector::text, ' ')::tsvector 
        FROM obj_type_value otv 
        WHERE otv.obj_id = o.id
    ) AS type_value_search,
    (
        SELECT string_agg(DISTINCT COALESCE(f.text, ''), ' ') 
        FROM obj_fact of
        JOIN fact f ON of.fact_id = f.id
        WHERE of.obj_id = o.id
    ) AS fact_text
    FROM obj o
    JOIN obj_type_value otv ON o.id = otv.obj_id
    WHERE o.creator_id IN (
        SELECT id
        FROM creator
        WHERE org_id = $1
    )
)
SELECT COUNT(DISTINCT o.id)
FROM objs o
JOIN creator c ON o.creator_id = c.id
LEFT JOIN obj_tag ot ON o.id = ot.obj_id
LEFT JOIN tag t ON ot.tag_id = t.id
LEFT JOIN obj_type_value otv ON o.id = otv.obj_id
LEFT JOIN obj_fact of ON o.id = of.obj_id
LEFT JOIN fact f ON of.fact_id = f.id
WHERE c.org_id = $1 AND o.deleted_at IS NULL
  AND ($2 = '' OR
       to_tsvector('english', o.name || ' ' || o.description || ' ' || o.id_string) @@ to_tsquery('english', $2) OR
       to_tsvector('english', fact_text) @@ to_tsquery('english', $2) OR
       type_value_search @@ to_tsquery('english', $2));