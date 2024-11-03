-- name: ListObjectsAdvanced :many
WITH object_data AS (
    -- First get all the searchable text and metadata for each object
    SELECT 
        o.id, 
        o.name, 
        o.description, 
        o.id_string, 
        o.creator_id,
        o.created_at, 
        o.deleted_at,
        -- Get fact counts and timestamps
        COUNT(DISTINCT f.id) as fact_count,
        MIN(f.created_at) as first_fact_date,
        MAX(f.created_at) as last_fact_date,
        -- Create separate tsvector fields for different search sources
        to_tsvector('english', 
            o.name || ' ' || 
            o.description || ' ' || 
            o.id_string || ' ' || 
            string_agg(DISTINCT t.name, ' ')
        ) AS obj_search,
        to_tsvector('english', string_agg(DISTINCT COALESCE(f.text, ''), ' ')) AS fact_search,
        -- Add type_value_search using search_vector
        (
            SELECT string_agg(otv.search_vector::text, ' ')::tsvector 
            FROM obj_type_value otv 
            WHERE otv.obj_id = o.id
        ) AS type_value_search,
        -- Get all steps for filtering
        array_agg(DISTINCT os.step_id) FILTER (WHERE os.step_id IS NOT NULL AND os.deleted_at IS NULL) as step_ids,
        -- Store steps and their sub_status for filtering
        jsonb_object_agg(
            os.step_id, 
            os.sub_status
        ) FILTER (WHERE os.step_id IS NOT NULL AND os.deleted_at IS NULL) as step_substatus,
        array_agg(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL) as tag_ids,
        array_agg(DISTINCT otv.type_id) FILTER (WHERE otv.type_id IS NOT NULL) as type_ids,
        -- Store IDs for later joins
        array_agg(DISTINCT otv.id) AS type_value_ids,
        -- Store steps data for returning
        array_agg(DISTINCT os.id) FILTER (WHERE os.id IS NOT NULL) AS obj_step_ids,
        -- Store type values for filtering
        jsonb_agg(DISTINCT otv.type_values) FILTER (WHERE otv.type_values IS NOT NULL) as all_type_values
    FROM obj o
    JOIN creator c ON o.creator_id = c.id
    LEFT JOIN obj_tag ot ON o.id = ot.obj_id
    LEFT JOIN tag t ON ot.tag_id = t.id
    LEFT JOIN obj_type_value otv ON o.id = otv.obj_id
    LEFT JOIN obj_fact of ON o.id = of.obj_id
    LEFT JOIN fact f ON of.fact_id = f.id
    LEFT JOIN obj_step os ON o.id = os.obj_id
    WHERE c.org_id = $1 AND o.deleted_at IS NULL
    GROUP BY o.id, o.name, o.description, o.id_string, o.creator_id, o.created_at, o.deleted_at
),
filtered_objects AS (
    SELECT od.*,
        -- Calculate search ranks for different sources
        CASE WHEN $2 = '' THEN NULL
             ELSE COALESCE(ts_rank(obj_search, websearch_to_tsquery('english', $2)) * 3.0, 0.0)
        END AS obj_rank,
        CASE WHEN $2 = '' THEN NULL
             ELSE COALESCE(ts_rank(fact_search, websearch_to_tsquery('english', $2)), 0.0)
        END AS fact_rank,
        CASE WHEN $2 = '' THEN NULL
             ELSE COALESCE(ts_rank(type_value_search, websearch_to_tsquery('english', $2)) * 2.0, 0.0)
        END AS type_value_rank
    FROM object_data od
    WHERE 
        -- Filter by steps if array is provided
        ($3::uuid[] IS NULL OR od.step_ids && $3) AND
        -- Filter by sub_status if array is provided and steps are filtered
        ($3::uuid[] IS NULL OR $14::int[] IS NULL OR (
            -- Check if all filtered steps have a matching sub_status
            NOT EXISTS (
                SELECT 1
                FROM unnest($3::uuid[]) AS step_id
                WHERE step_id = ANY(od.step_ids)
                  AND NOT (od.step_substatus->step_id::text)::int = ANY($14::int[])
            )
        )) AND
        -- Filter by tags if array is provided
        ($4::uuid[] IS NULL OR od.tag_ids && $4) AND
        -- Filter by object types if array is provided
        ($5::uuid[] IS NULL OR od.type_ids && $5) AND
        -- Filter by type value criteria 1 with LIKE
        ($6::jsonb IS NULL OR 
         EXISTS (
             SELECT 1 
             FROM jsonb_array_elements(od.all_type_values) tv,
                  jsonb_each_text(tv) fields
             WHERE 
                CASE 
                    WHEN jsonb_typeof($6) = 'object' THEN
                        EXISTS (
                            SELECT 1
                            FROM jsonb_each_text($6) criteria
                            WHERE fields.key = criteria.key 
                            AND fields.value ILIKE '%' || criteria.value || '%'
                        )
                    ELSE false
                END
         )) AND
        -- Filter by type value criteria 2 with LIKE
        ($7::jsonb IS NULL OR 
         EXISTS (
             SELECT 1 
             FROM jsonb_array_elements(od.all_type_values) tv,
                  jsonb_each_text(tv) fields
             WHERE 
                CASE 
                    WHEN jsonb_typeof($7) = 'object' THEN
                        EXISTS (
                            SELECT 1
                            FROM jsonb_each_text($7) criteria
                            WHERE fields.key = criteria.key 
                            AND fields.value ILIKE '%' || criteria.value || '%'
                        )
                    ELSE false
                END
         )) AND
        -- Filter by type value criteria 3 with LIKE
        ($8::jsonb IS NULL OR 
         EXISTS (
             SELECT 1 
             FROM jsonb_array_elements(od.all_type_values) tv,
                  jsonb_each_text(tv) fields
             WHERE 
                CASE 
                    WHEN jsonb_typeof($8) = 'object' THEN
                        EXISTS (
                            SELECT 1
                            FROM jsonb_each_text($8) criteria
                            WHERE fields.key = criteria.key 
                            AND fields.value ILIKE '%' || criteria.value || '%'
                        )
                    ELSE false
                END
         )) AND
        -- Text search condition
        ($2 = '' OR
         obj_search @@ websearch_to_tsquery('english', $2) OR
         fact_search @@ websearch_to_tsquery('english', $2) OR
         type_value_search @@ websearch_to_tsquery('english', $2))
)
SELECT 
    fo.id, 
    fo.name, 
    fo.description, 
    fo.id_string, 
    fo.created_at,
    fo.fact_count,
    fo.first_fact_date,
    fo.last_fact_date,
    CASE 
        WHEN $2 = '' THEN NULL
        ELSE COALESCE(fo.obj_rank, 0.0) + COALESCE(fo.fact_rank, 0.0) + COALESCE(fo.type_value_rank, 0.0)
    END as search_rank,
    coalesce(
        (SELECT jsonb_agg(jsonb_build_object(
            'id', t.id
        ))
        FROM tag t
        WHERE t.id = ANY(fo.tag_ids)),
        '[]'
    ) AS tags,
    coalesce(
        (SELECT jsonb_agg(jsonb_build_object(
            'id', otv.id,
            'objectTypeId', otv.type_id,
            'type_values', otv.type_values
        ))
        FROM obj_type_value otv
        WHERE otv.id = ANY(fo.type_value_ids)),
        '[]'
    ) AS type_values,
    -- Include steps with sub_status and last_updated
    coalesce(
        (SELECT jsonb_agg(jsonb_build_object(
            'id', os.id,
            'stepId', s.id,
            'subStatus', os.sub_status,
            'createdAt', os.created_at,
            'lastUpdated', os.last_updated
        ) ORDER BY f.id, s.step_order)
        FROM obj_step os
        JOIN step s ON os.step_id = s.id
        JOIN funnel f ON s.funnel_id = f.id
        WHERE os.id = ANY(fo.obj_step_ids) AND os.deleted_at IS NULL),
        '[]'
    ) AS steps
FROM filtered_objects fo
ORDER BY
    -- First by search rank if searching
    CASE WHEN $2 = '' THEN 0 ELSE (fo.obj_rank + fo.fact_rank + fo.type_value_rank) END DESC,
    -- Then by specified ordering
    CASE WHEN COALESCE($10, false) THEN  -- When ascending (with proper boolean handling)
        CASE $9
            WHEN 'fact_count' THEN fo.fact_count::text
            WHEN 'created_at' THEN fo.created_at::text
            WHEN 'first_fact' THEN COALESCE(fo.first_fact_date::text, fo.created_at::text)
            WHEN 'last_fact' THEN COALESCE(fo.last_fact_date::text, fo.created_at::text)
            WHEN 'name' THEN fo.name
            WHEN 'type_value' THEN (
                SELECT fields.value::text
                FROM jsonb_array_elements(fo.all_type_values) AS tv
                CROSS JOIN LATERAL jsonb_each_text(tv) AS fields
                WHERE fields.key = $11::text
                LIMIT 1
            )
            ELSE fo.created_at::text
        END
    END ASC NULLS LAST,
    CASE WHEN NOT COALESCE($10, false) THEN  -- When descending (with proper boolean handling)
        CASE $9
            WHEN 'fact_count' THEN fo.fact_count::text
            WHEN 'created_at' THEN fo.created_at::text
            WHEN 'first_fact' THEN COALESCE(fo.first_fact_date::text, fo.created_at::text)
            WHEN 'last_fact' THEN COALESCE(fo.last_fact_date::text, fo.created_at::text)
            WHEN 'name' THEN fo.name
            WHEN 'type_value' THEN (
                SELECT fields.value::text
                FROM jsonb_array_elements(fo.all_type_values) AS tv
                CROSS JOIN LATERAL jsonb_each_text(tv) AS fields
                WHERE fields.key = $11::text
                LIMIT 1
            )
            ELSE fo.created_at::text
        END
    END DESC NULLS LAST
LIMIT $12 OFFSET $13;