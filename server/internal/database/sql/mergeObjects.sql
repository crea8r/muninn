-- name: MergeObjects :exec
WITH target_org AS (
    -- Get organization ID for the target object once
    SELECT c.org_id
    FROM obj o
    JOIN creator c ON o.creator_id = c.id
    WHERE o.id = $1
    AND o.deleted_at IS NULL
),
-- Update fact references
update_fact_refs AS (
    UPDATE obj_fact
    SET obj_id = $1
    WHERE obj_id = ANY($2::uuid[])
    AND EXISTS (
        SELECT 1 FROM target_org
        WHERE obj_fact.obj_id IN (
            SELECT o.id 
            FROM obj o 
            JOIN creator c ON o.creator_id = c.id 
            WHERE o.id = ANY($2::uuid[])
            AND c.org_id = target_org.org_id
        )
    )
    RETURNING 1
),
-- Update task references
update_task_refs AS (
    UPDATE obj_task
    SET obj_id = $1
    WHERE obj_id = ANY($2::uuid[])
    AND EXISTS (
        SELECT 1 FROM target_org
        WHERE obj_task.obj_id IN (
            SELECT o.id 
            FROM obj o 
            JOIN creator c ON o.creator_id = c.id 
            WHERE o.id = ANY($2::uuid[])
            AND c.org_id = target_org.org_id
        )
    )
    RETURNING 1
),
-- Copy tags
copy_tags AS (
    INSERT INTO obj_tag (obj_id, tag_id)
    SELECT DISTINCT $1, tag_id
    FROM obj_tag ot
    JOIN obj o ON ot.obj_id = o.id
    JOIN creator c ON o.creator_id = c.id
    JOIN target_org t ON c.org_id = t.org_id
    WHERE ot.obj_id = ANY($2::uuid[])
    ON CONFLICT DO NOTHING
    RETURNING 1
),
-- Update steps
update_steps AS (
    UPDATE obj_step
    SET obj_id = $1,
        last_updated = CURRENT_TIMESTAMP
    WHERE obj_id = ANY($2::uuid[])
    AND deleted_at IS NULL
    AND EXISTS (
        SELECT 1 FROM target_org
        WHERE obj_step.obj_id IN (
            SELECT o.id 
            FROM obj o 
            JOIN creator c ON o.creator_id = c.id 
            WHERE o.id = ANY($2::uuid[])
            AND c.org_id = target_org.org_id
        )
    )
    AND NOT EXISTS (
        SELECT 1
        FROM obj_step os2
        WHERE os2.obj_id = $1
        AND os2.step_id = obj_step.step_id
        AND os2.deleted_at IS NULL
    )
    RETURNING 1
),
-- Update type values references
update_type_values AS (
    UPDATE obj_type_value otv
    SET type_values = (
        SELECT jsonb_object_agg(
            t.key,
            CASE
                WHEN jsonb_typeof(t.value) = 'string' THEN
                    COALESCE(
                        (
                            SELECT to_jsonb(replace(t.value #>> '{}', source_id::text, $1::text))
                            FROM unnest($2::uuid[]) as source_id
                            WHERE t.value #>> '{}' LIKE '%' || source_id::text || '%'
                            LIMIT 1
                        ),
                        t.value
                    )
                ELSE t.value
            END
        )
        FROM jsonb_each(otv.type_values) t
    )
    WHERE EXISTS (
        SELECT 1 FROM target_org
        WHERE otv.obj_id IN (
            SELECT o.id 
            FROM obj o 
            JOIN creator c ON o.creator_id = c.id 
            WHERE (o.id = ANY($2::uuid[]) OR o.id = $1)
            AND c.org_id = target_org.org_id
        )
    )
    AND otv.deleted_at IS NULL
    AND otv.type_values::text LIKE ANY(
        SELECT '%' || source_id::text || '%'
        FROM unnest($2::uuid[]) AS source_id
    )
    RETURNING 1
),
-- Update fact text
update_fact_text AS (
    UPDATE fact f
    SET text = (
        SELECT reduce_array.modified_text
        FROM (
            SELECT source_id,
                replace(f.text, source_id::text, $1::text) as modified_text
            FROM unnest($2::uuid[]) AS source_id
            WHERE f.text LIKE '%' || source_id::text || '%'
            LIMIT 1
        ) reduce_array
    )
    WHERE EXISTS (
        SELECT 1 FROM target_org
        WHERE f.creator_id IN (
            SELECT id FROM creator 
            WHERE org_id = target_org.org_id
        )
    )
    AND f.deleted_at IS NULL
    AND f.text LIKE ANY(
        SELECT '%' || source_id::text || '%'
        FROM unnest($2::uuid[]) AS source_id
    )
    RETURNING 1
),
-- Update task text
update_task_text AS (
    UPDATE task t
    SET content = (
        SELECT reduce_array.modified_text
        FROM (
            SELECT source_id,
                replace(t.content, source_id::text, $1::text) as modified_text
            FROM unnest($2::uuid[]) AS source_id
            WHERE t.content LIKE '%' || source_id::text || '%'
            LIMIT 1
        ) reduce_array
    )
    WHERE EXISTS (
        SELECT 1 FROM target_org
        WHERE t.creator_id IN (
            SELECT id FROM creator 
            WHERE org_id = target_org.org_id
        )
    )
    AND t.deleted_at IS NULL
    AND t.content LIKE ANY(
        SELECT '%' || source_id::text || '%'
        FROM unnest($2::uuid[]) AS source_id
    )
    RETURNING 1
),
-- Mark source objects as deleted
mark_deleted AS (
    UPDATE obj o
    SET deleted_at = CURRENT_TIMESTAMP,
    id_string = UUID_GENERATE_V4()::text
    WHERE id = ANY($2::uuid[])
    AND EXISTS (
        SELECT 1 FROM target_org
        WHERE o.creator_id IN (
            SELECT id FROM creator 
            WHERE org_id = target_org.org_id
        )
    )
    RETURNING 1
)
-- Create merge history record
INSERT INTO object_merge_history (
    target_object_id,
    source_object_ids,
    merged_at,
    creator_id
)
VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
RETURNING id;

-- name: ValidateMergeObjects :one
WITH obj_check AS (
    -- Get object count and org_id for all objects
    SELECT 
        COUNT(*) as obj_count,
        c.org_id
    FROM obj o
    JOIN creator c ON o.creator_id = c.id
    WHERE o.id = ANY($1::uuid[])
    AND o.deleted_at IS NULL
    GROUP BY c.org_id
),
creator_org AS (
    -- Get the creator's org_id
    SELECT org_id 
    FROM creator 
    WHERE creator.id = $2 
    AND deleted_at IS NULL
    AND active = true
)
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM creator_org) 
            THEN 'Creator not found or inactive'
        WHEN NOT EXISTS (SELECT 1 FROM obj_check) 
            THEN 'Objects not found'
        WHEN (SELECT obj_count FROM obj_check) > 5 
            THEN 'Cannot merge more than 5 objects'
        WHEN (SELECT obj_count FROM obj_check) = 1 
            THEN 'Need at least 2 objects to merge'
        WHEN (SELECT COUNT(*) FROM obj_check) > 1 
            THEN 'Objects must belong to the same organization'
        WHEN NOT EXISTS (
            SELECT 1 
            FROM obj_check o 
            JOIN creator_org c ON o.org_id = c.org_id
        ) THEN 'Creator does not have permission to merge these objects'
        ELSE 'valid'
    END as validation_result,
    (SELECT org_id FROM creator_org) as creator_org_id,
    COALESCE(
        (SELECT org_id FROM obj_check), 
        NULL
    ) as objects_org_id;