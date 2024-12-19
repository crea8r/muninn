-- name: AddTagAndStepToFilteredObjects :many
WITH RECURSIVE 
-- First find the first step of the funnel if funnel_id is provided
first_step AS (
    SELECT s.id as step_id
    FROM step s
    WHERE s.funnel_id = $11
    AND s.deleted_at IS NULL
    ORDER BY s.step_order ASC
    LIMIT 1
),
-- Get filtered objects same as before
object_data AS (
    SELECT 
        o.id, 
        array_agg(DISTINCT os.step_id) FILTER (WHERE os.step_id IS NOT NULL AND os.deleted_at IS NULL) as step_ids,
        array_agg(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL) as tag_ids,
        array_agg(DISTINCT otv.type_id) FILTER (WHERE otv.type_id IS NOT NULL) as type_ids,
        array_agg(DISTINCT s.funnel_id) FILTER (WHERE s.funnel_id IS NOT NULL) as funnel_ids,
        jsonb_object_agg(
            os.step_id, 
            os.sub_status
        ) FILTER (WHERE os.step_id IS NOT NULL AND os.deleted_at IS NULL) as step_substatus,
        jsonb_agg(DISTINCT otv.type_values) FILTER (WHERE otv.type_values IS NOT NULL) as all_type_values,
        to_tsvector('english', 
            o.name || ' ' || 
            o.description || ' ' || 
            o.id_string || ' ' || 
            array_to_string(o.aliases, ' ') || ' ' ||
            COALESCE(string_agg(DISTINCT t.name, ' '), '')
        ) AS obj_search,
        to_tsvector('english', string_agg(DISTINCT COALESCE(f.text, ''), ' ')) AS fact_search,
        (
            SELECT string_agg(otv.search_vector::text, ' ')::tsvector 
            FROM obj_type_value otv 
            WHERE otv.obj_id = o.id
        ) AS type_value_search
    FROM obj o
    JOIN creator c ON o.creator_id = c.id
    LEFT JOIN obj_tag ot ON o.id = ot.obj_id
    LEFT JOIN tag t ON ot.tag_id = t.id
    LEFT JOIN obj_type_value otv ON o.id = otv.obj_id
    LEFT JOIN obj_fact of ON o.id = of.obj_id
    LEFT JOIN fact f ON of.fact_id = f.id
    LEFT JOIN obj_step os ON o.id = os.obj_id AND os.deleted_at IS NULL
    LEFT JOIN step s ON os.step_id = s.id AND s.deleted_at IS NULL
    WHERE c.org_id = $1 AND o.deleted_at IS NULL
    GROUP BY o.id
),
filtered_objects AS (
    SELECT 
        od.id
    FROM object_data od
    WHERE 
        -- Original filters remain unchanged
        ($3::uuid[] IS NULL OR od.step_ids && $3) AND
        ($3::uuid[] IS NULL OR $9::int[] IS NULL OR (
            NOT EXISTS (
                SELECT 1
                FROM unnest($3::uuid[]) AS step_id
                WHERE step_id = ANY(od.step_ids)
                  AND NOT (od.step_substatus->step_id::text)::int = ANY($9::int[])
            )
        )) AND
        ($4::uuid[] IS NULL OR od.tag_ids && $4) AND
        ($5::uuid[] IS NULL OR od.type_ids && $5) AND
        ((COALESCE($6::jsonb, 'null'::jsonb) = 'null'::jsonb) OR 
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
        ((COALESCE($7::jsonb, 'null'::jsonb) = 'null'::jsonb) OR 
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
        ((COALESCE($8::jsonb, 'null'::jsonb) = 'null'::jsonb) OR 
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
        ($2::text = '' OR
         obj_search @@ websearch_to_tsquery('english', $2) OR
         fact_search @@ websearch_to_tsquery('english', $2) OR
         type_value_search @@ websearch_to_tsquery('english', $2)) AND
        -- Additional filters to ensure we don't add duplicates
        (COALESCE($10::uuid, '00000000-0000-0000-0000-000000000000'::uuid) = '00000000-0000-0000-0000-000000000000'::uuid 
        OR NOT ($10 = ANY(od.tag_ids)) OR od.tag_ids IS NULL) AND
        (COALESCE($11::uuid, '00000000-0000-0000-0000-000000000000'::uuid) = '00000000-0000-0000-0000-000000000000'::uuid 
        OR NOT ($11 = ANY(od.funnel_ids)) OR od.funnel_ids IS NULL)
    LIMIT 100
),
-- Insert tag relations if tag_id is provided
inserted_tags AS (
    INSERT INTO obj_tag (obj_id, tag_id)
    SELECT 
        fo.id,
        CASE 
            WHEN $10::uuid <> '00000000-0000-0000-0000-000000000000'::uuid THEN $10 
        ELSE NULL 
    END
    FROM filtered_objects fo
    WHERE 
        COALESCE($10::uuid, '00000000-0000-0000-0000-000000000000'::uuid) <> '00000000-0000-0000-0000-000000000000'::uuid 
    ON CONFLICT DO NOTHING
    RETURNING obj_id
),
-- Insert step relations if funnel_id is provided
inserted_steps AS (
    INSERT INTO obj_step (obj_id, step_id, creator_id)
    SELECT fo.id, fs.step_id, $12
    FROM filtered_objects fo
    CROSS JOIN first_step fs
    WHERE 
    COALESCE($11::uuid, '00000000-0000-0000-0000-000000000000'::uuid) <> '00000000-0000-0000-0000-000000000000'::uuid 
    AND fs.step_id IS NOT NULL
    ON CONFLICT DO NOTHING
    RETURNING obj_id
)
-- Return affected object IDs and what was done to them
SELECT DISTINCT fo.id,
    CASE WHEN it.obj_id IS NOT NULL THEN true ELSE false END as tag_added,
    CASE WHEN ist.obj_id IS NOT NULL THEN true ELSE false END as step_added
FROM filtered_objects fo
LEFT JOIN inserted_tags it ON fo.id = it.obj_id
LEFT JOIN inserted_steps ist ON fo.id = ist.obj_id
WHERE (it.obj_id IS NOT NULL OR ist.obj_id IS NOT NULL) -- Only return objects that were modified
ORDER BY fo.id;