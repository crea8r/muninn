// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: listObjects.sql

package database

import (
	"context"
	"time"

	"github.com/google/uuid"
)

const countObjectsByOrgID = `-- name: CountObjectsByOrgID :one
WITH objs AS (
    SELECT o.id, o.name, o.description, o.id_string, o.creator_id, o.created_at, o.deleted_at, 
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
       type_value_search @@ to_tsquery('english', $2))
`

type CountObjectsByOrgIDParams struct {
	OrgID   uuid.UUID   `json:"org_id"`
	Column2 interface{} `json:"column_2"`
}

func (q *Queries) CountObjectsByOrgID(ctx context.Context, arg CountObjectsByOrgIDParams) (int64, error) {
	row := q.queryRow(ctx, q.countObjectsByOrgIDStmt, countObjectsByOrgID, arg.OrgID, arg.Column2)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const listObjectsByOrgID = `-- name: ListObjectsByOrgID :many
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
    GROUP BY o.id, o.name, o.description, o.id_string, o.creator_id, o.created_at, o.deleted_at
),
ranked_results AS (
    -- Calculate search ranking and highlighting for each source
    SELECT 
        od.id, od.name, od.description, od.id_string, od.creator_id, od.created_at, od.deleted_at, od.obj_search, od.fact_search, od.type_value_search, od.obj_text, od.fact_text, od.type_value_text, od.tag_ids, od.type_value_ids,
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
LIMIT $3 OFFSET $4
`

type ListObjectsByOrgIDParams struct {
	OrgID   uuid.UUID   `json:"org_id"`
	Column2 interface{} `json:"column_2"`
	Limit   int32       `json:"limit"`
	Offset  int32       `json:"offset"`
}

type ListObjectsByOrgIDRow struct {
	ID                uuid.UUID   `json:"id"`
	Name              string      `json:"name"`
	Description       string      `json:"description"`
	IDString          string      `json:"id_string"`
	CreatedAt         time.Time   `json:"created_at"`
	MatchSource       string      `json:"match_source"`
	ObjHeadline       interface{} `json:"obj_headline"`
	FactHeadline      interface{} `json:"fact_headline"`
	TypeValueHeadline interface{} `json:"type_value_headline"`
	SearchRank        interface{} `json:"search_rank"`
	Tags              interface{} `json:"tags"`
	TypeValues        interface{} `json:"type_values"`
}

func (q *Queries) ListObjectsByOrgID(ctx context.Context, arg ListObjectsByOrgIDParams) ([]ListObjectsByOrgIDRow, error) {
	rows, err := q.query(ctx, q.listObjectsByOrgIDStmt, listObjectsByOrgID,
		arg.OrgID,
		arg.Column2,
		arg.Limit,
		arg.Offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListObjectsByOrgIDRow
	for rows.Next() {
		var i ListObjectsByOrgIDRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.IDString,
			&i.CreatedAt,
			&i.MatchSource,
			&i.ObjHeadline,
			&i.FactHeadline,
			&i.TypeValueHeadline,
			&i.SearchRank,
			&i.Tags,
			&i.TypeValues,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}