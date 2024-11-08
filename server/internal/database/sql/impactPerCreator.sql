-- name: GetCreatorDailyActivity :many
WITH RECURSIVE dates AS (
    -- Generate series of last 30 days, keep as TIMESTAMP
    SELECT date_trunc('day', NOW())::TIMESTAMP - interval '29 days' AS day
    UNION ALL
    SELECT (day + INTERVAL '1 day')::TIMESTAMP
    FROM dates
    WHERE day < date_trunc('day', NOW())::TIMESTAMP
),
daily_fact_metrics AS (
    -- Facts created per day
    SELECT 
        date_trunc('day', f.created_at) as day,
        COUNT(f.id) as fact_count,
        COUNT(DISTINCT of.obj_id) as fact_objects_count
    FROM fact f
    LEFT JOIN obj_fact of ON f.id = of.fact_id
    WHERE f.creator_id = $1
        AND f.created_at > NOW() - INTERVAL '30 days'
        AND f.deleted_at IS NULL
    GROUP BY date_trunc('day', f.created_at)
),
daily_task_metrics AS (
    -- Tasks activity per day
    SELECT 
        date_trunc('day', COALESCE(t.last_updated, t.created_at)) as day,
        COUNT(DISTINCT t.id) as task_count,
        COUNT(DISTINCT CASE 
            WHEN t.status = 'completed' THEN t.id 
            ELSE NULL 
        END) as completed_tasks,
        COUNT(DISTINCT ot.obj_id) as task_objects_count
    FROM task t
    LEFT JOIN obj_task ot ON t.id = ot.task_id
    WHERE t.creator_id = $1
        AND (t.created_at > NOW() - INTERVAL '30 days' 
             OR t.last_updated > NOW() - INTERVAL '30 days')
        AND t.deleted_at IS NULL
    GROUP BY date_trunc('day', COALESCE(t.last_updated, t.created_at))
),
daily_object_metrics AS (
    -- Object updates per day
    SELECT 
        date_trunc('day', COALESCE(otv.created_at, o.created_at)) as day,
        COUNT(DISTINCT CASE WHEN o.created_at > NOW() - INTERVAL '30 days' THEN o.id END) as objects_created,
        COUNT(DISTINCT otv.id) as type_values_added,
        COUNT(DISTINCT ot.tag_id) as tags_added
    FROM obj o
    LEFT JOIN obj_type_value otv ON o.id = otv.obj_id 
        AND otv.created_at > NOW() - INTERVAL '30 days'
    LEFT JOIN obj_tag ot ON o.id = ot.obj_id
    WHERE o.creator_id = $1
        AND (o.created_at > NOW() - INTERVAL '30 days'
             OR otv.created_at > NOW() - INTERVAL '30 days')
        AND o.deleted_at IS NULL
    GROUP BY date_trunc('day', COALESCE(otv.created_at, o.created_at))
),
daily_funnel_metrics AS (
    -- Funnel progress updates per day
    SELECT 
        date_trunc('day', COALESCE(last_updated, created_at)) as day,
        COUNT(DISTINCT obj_id) as objects_moved,
        COUNT(DISTINCT step_id) as steps_involved
    FROM obj_step
    WHERE creator_id = $1
        AND (created_at > NOW() - INTERVAL '30 days'
             OR last_updated > NOW() - INTERVAL '30 days')
        AND deleted_at IS NULL
    GROUP BY date_trunc('day', COALESCE(last_updated, created_at))
),
daily_funnel_creation_metrics AS (
    -- Funnel and step creation/updates per day
    SELECT 
        date_trunc('day', COALESCE(s.last_updated, f.created_at)) as day,
        COUNT(DISTINCT CASE WHEN f.created_at > NOW() - INTERVAL '30 days' THEN f.id END) as funnels_created,
        COUNT(DISTINCT CASE WHEN s.created_at > NOW() - INTERVAL '30 days' THEN s.id END) as steps_created,
        COUNT(DISTINCT CASE 
            WHEN s.last_updated > s.created_at THEN s.id 
            ELSE NULL 
        END) as steps_updated,
        COUNT(DISTINCT CASE 
            WHEN s.last_updated > s.created_at 
            AND s.created_at <= NOW() - INTERVAL '30 days'
            THEN s.id 
            ELSE NULL 
        END) as steps_modified
    FROM funnel f
    LEFT JOIN step s ON f.id = s.funnel_id
    WHERE f.creator_id = $1
        AND (f.created_at > NOW() - INTERVAL '30 days'
             OR s.created_at > NOW() - INTERVAL '30 days'
             OR s.last_updated > NOW() - INTERVAL '30 days')
        AND f.deleted_at IS NULL
        AND (s.deleted_at IS NULL OR s.deleted_at > NOW() - INTERVAL '30 days')
    GROUP BY date_trunc('day', COALESCE(s.last_updated, f.created_at))
),
daily_object_type_metrics AS (
    -- Object type creation and updates per day
    SELECT 
        date_trunc('day', ot.created_at) as day,
        COUNT(DISTINCT ot.id) as types_created,
        COUNT(DISTINCT CASE 
            WHEN ot.created_at <= NOW() - INTERVAL '30 days' 
            AND EXISTS (
                SELECT 1 FROM obj_type_value otv 
                WHERE otv.type_id = ot.id 
                AND otv.created_at > NOW() - INTERVAL '30 days'
            ) THEN ot.id 
            ELSE NULL 
        END) as types_used,
        COUNT(DISTINCT CASE 
            WHEN ot.created_at <= NOW() - INTERVAL '30 days' 
            THEN ot.id 
            ELSE NULL 
        END) as types_updated
    FROM obj_type ot
    WHERE ot.creator_id = $1
        AND (ot.created_at > NOW() - INTERVAL '30 days')
        AND ot.deleted_at IS NULL
    GROUP BY date_trunc('day', ot.created_at)
)
SELECT 
    d.day::TIMESTAMP as activity_date,  -- Explicit TIMESTAMP cast
    -- Facts metrics
    COALESCE(dfm.fact_count, 0) as facts_created,
    COALESCE(dfm.fact_objects_count, 0) as fact_objects_involved,
    -- Task metrics
    COALESCE(dtm.task_count, 0) as tasks_total,
    COALESCE(dtm.completed_tasks, 0) as tasks_completed,
    COALESCE(dtm.task_objects_count, 0) as task_objects_involved,
    -- Object metrics
    COALESCE(dom.objects_created, 0) as objects_created,
    COALESCE(dom.type_values_added, 0) as type_values_added,
    COALESCE(dom.tags_added, 0) as tags_added,
    -- Funnel progress metrics
    COALESCE(dfnm.objects_moved, 0) as objects_moved_in_funnels,
    COALESCE(dfnm.steps_involved, 0) as funnel_steps_involved,
    -- Funnel creation metrics
    COALESCE(dfcm.funnels_created, 0) as funnels_created,
    COALESCE(dfcm.steps_created, 0) as steps_created,
    COALESCE(dfcm.steps_updated, 0) as steps_updated,
    COALESCE(dfcm.steps_modified, 0) as steps_modified,
    -- Object type metrics
    COALESCE(dotm.types_created, 0) as types_created,
    COALESCE(dotm.types_used, 0) as types_used,
    COALESCE(dotm.types_updated, 0) as types_updated,
    -- Calculate daily activity score
    CAST((
      -- Data entry activities
      COALESCE(dfm.fact_count, 0) * 2.0 +
      COALESCE(dtm.completed_tasks, 0) * 3.0 +
      COALESCE(dtm.task_count - dtm.completed_tasks, 0) * 1.0 +
      COALESCE(dom.objects_created, 0) * 2.0 +
      COALESCE(dom.type_values_added, 0) * 1.0 +
      COALESCE(dom.tags_added, 0) * 0.5 +
      COALESCE(dfnm.objects_moved, 0) * 1.5 +
      
      -- Administrative/structural activities
      COALESCE(dfcm.funnels_created, 0) * 4.0 +
      COALESCE(dfcm.steps_created, 0) * 3.0 +
      COALESCE(dfcm.steps_updated, 0) * 1.5 +
      COALESCE(dfcm.steps_modified, 0) * 2.0 +
      COALESCE(dotm.types_created, 0) * 5.0 +
      COALESCE(dotm.types_used, 0) * 2.0 +
      COALESCE(dotm.types_updated, 0) * 2.5
  ) AS double precision) as daily_activity_score
FROM dates d
LEFT JOIN daily_fact_metrics dfm ON d.day = dfm.day
LEFT JOIN daily_task_metrics dtm ON d.day = dtm.day
LEFT JOIN daily_object_metrics dom ON d.day = dom.day
LEFT JOIN daily_funnel_metrics dfnm ON d.day = dfnm.day
LEFT JOIN daily_funnel_creation_metrics dfcm ON d.day = dfcm.day
LEFT JOIN daily_object_type_metrics dotm ON d.day = dotm.day
ORDER BY d.day DESC;