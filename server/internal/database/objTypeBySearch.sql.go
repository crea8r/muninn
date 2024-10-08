// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: objTypeBySearch.sql

package database

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

const countObjectsByTypeWithAdvancedFilter = `-- name: CountObjectsByTypeWithAdvancedFilter :one
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
           coalesce(otv.type_values::text, '')) @@ plainto_tsquery('english', $5))
`

type CountObjectsByTypeWithAdvancedFilterParams struct {
	TypeID  uuid.UUID       `json:"type_id"`
	OrgID   uuid.UUID       `json:"org_id"`
	Column3 json.RawMessage `json:"column_3"`
	Column4 []uuid.UUID     `json:"column_4"`
	Column5 string          `json:"column_5"`
}

func (q *Queries) CountObjectsByTypeWithAdvancedFilter(ctx context.Context, arg CountObjectsByTypeWithAdvancedFilterParams) (int64, error) {
	row := q.queryRow(ctx, q.countObjectsByTypeWithAdvancedFilterStmt, countObjectsByTypeWithAdvancedFilter,
		arg.TypeID,
		arg.OrgID,
		arg.Column3,
		pq.Array(arg.Column4),
		arg.Column5,
	)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const listObjectsByTypeWithAdvancedFilter = `-- name: ListObjectsByTypeWithAdvancedFilter :many
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
LIMIT $7 OFFSET $8
`

type ListObjectsByTypeWithAdvancedFilterParams struct {
	TypeID  uuid.UUID       `json:"type_id"`
	OrgID   uuid.UUID       `json:"org_id"`
	Column3 json.RawMessage `json:"column_3"`
	Column4 []uuid.UUID     `json:"column_4"`
	Column5 string          `json:"column_5"`
	Column6 interface{}     `json:"column_6"`
	Limit   int32           `json:"limit"`
	Offset  int32           `json:"offset"`
}

type ListObjectsByTypeWithAdvancedFilterRow struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	CreatedAt   time.Time       `json:"created_at"`
	Tags        interface{}     `json:"tags"`
	TypeValues  json.RawMessage `json:"type_values"`
}

func (q *Queries) ListObjectsByTypeWithAdvancedFilter(ctx context.Context, arg ListObjectsByTypeWithAdvancedFilterParams) ([]ListObjectsByTypeWithAdvancedFilterRow, error) {
	rows, err := q.query(ctx, q.listObjectsByTypeWithAdvancedFilterStmt, listObjectsByTypeWithAdvancedFilter,
		arg.TypeID,
		arg.OrgID,
		arg.Column3,
		pq.Array(arg.Column4),
		arg.Column5,
		arg.Column6,
		arg.Limit,
		arg.Offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListObjectsByTypeWithAdvancedFilterRow
	for rows.Next() {
		var i ListObjectsByTypeWithAdvancedFilterRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.CreatedAt,
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
