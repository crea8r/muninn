-- name: CountObjectsAdvanced :one
WITH object_data AS (
    SELECT 
        o.id,
        -- Enhanced search vector including tag names (matching ListObjectsAdvanced)
        to_tsvector('english', 
            o.name || ' ' || 
            o.description || ' ' || 
            o.id_string || ' ' || 
            string_agg(DISTINCT t.name, ' ')  -- Add tag names to search
        ) AS obj_search,
        to_tsvector('english', string_agg(DISTINCT COALESCE(f.text, ''), ' ')) AS fact_search,
        (
            SELECT string_agg(otv.search_vector::text, ' ')::tsvector 
            FROM obj_type_value otv 
            WHERE otv.obj_id = o.id
        ) AS type_value_search,
        -- Get all steps for filtering with their sub_status
        array_agg(DISTINCT os.step_id) FILTER (WHERE os.step_id IS NOT NULL AND os.deleted_at IS NULL) as step_ids,
        -- Store steps and their sub_status for filtering
        jsonb_object_agg(
            os.step_id, 
            os.sub_status
        ) FILTER (WHERE os.step_id IS NOT NULL AND os.deleted_at IS NULL) as step_substatus,
        array_agg(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL) as tag_ids,
        array_agg(DISTINCT otv.type_id) FILTER (WHERE otv.type_id IS NOT NULL) as type_ids,
        -- Store type values for filtering
        jsonb_agg(DISTINCT otv.type_values) FILTER (WHERE otv.type_values IS NOT NULL) as all_type_values
    FROM obj o
    JOIN creator c ON o.creator_id = c.id
    LEFT JOIN obj_tag ot ON o.id = ot.obj_id
    LEFT JOIN tag t ON ot.tag_id = t.id
    LEFT JOIN obj_type_value otv ON o.id = otv.obj_id
    LEFT JOIN obj_fact of ON o.id = of.obj_id
    LEFT JOIN fact f ON of.fact_id = f.id
    LEFT JOIN obj_step os ON o.id = os.obj_id AND os.deleted_at IS NULL
    WHERE c.org_id = $1 AND o.deleted_at IS NULL
    GROUP BY o.id, o.name, o.description, o.id_string
),
filtered_objects AS (
    SELECT od.id, od.step_ids, od.step_substatus
    FROM object_data od
    WHERE 
        -- Filter by steps if array is provided
        ($3::uuid[] IS NULL OR od.step_ids && $3) AND
        -- Filter by sub_status if array is provided and steps are filtered
        ($3::uuid[] IS NULL OR $9::int[] IS NULL OR (
            NOT EXISTS (
                SELECT 1
                FROM unnest($3::uuid[]) AS step_id
                WHERE step_id = ANY(od.step_ids)
                  AND NOT (od.step_substatus->step_id::text)::int = ANY($9::int[])
            )
        )) AND
        -- Filter by tags
        ($4::uuid[] IS NULL OR od.tag_ids && $4) AND
        -- Filter by object types
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
        -- Text search condition with enhanced search vector
        ($2 = '' OR
         obj_search @@ websearch_to_tsquery('english', $2) OR
         fact_search @@ websearch_to_tsquery('english', $2) OR
         type_value_search @@ websearch_to_tsquery('english', $2))
),
step_counts AS (
    -- Get counts for each step
    SELECT 
        s.id as step_id,
        COUNT(DISTINCT fo.id) as count
    FROM (
        SELECT id
        FROM step
        WHERE ($3::uuid[] IS NULL OR id = ANY($3))
          AND deleted_at IS NULL
    ) s
    LEFT JOIN filtered_objects fo ON s.id = ANY(fo.step_ids)
    WHERE 
        -- Apply sub_status filter if provided
        $9::int[] IS NULL OR
        (fo.step_substatus->s.id::text)::int = ANY($9::int[])
    GROUP BY s.id
)
SELECT 
    jsonb_build_object(
        'total_count', (SELECT COUNT(DISTINCT id) FROM filtered_objects),
        'step_counts', COALESCE(
            (SELECT 
                jsonb_object_agg(
                    step_id::text,
                    count
                )
            FROM step_counts),
            '{}'::jsonb
        )
    );