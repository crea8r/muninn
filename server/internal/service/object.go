// service/object.go
package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/internal/pagination"
	"github.com/google/uuid"
)

const listObjectsAdvancedStmt = `-- name: ListObjectsAdvanced :many
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
        to_tsvector('english', o.name || ' ' || o.description || ' ' || o.id_string) AS obj_search,
        to_tsvector('english', string_agg(DISTINCT COALESCE(f.text, ''), ' ')) AS fact_search,
        -- Add type_value_search using search_vector
        (
            SELECT string_agg(otv.search_vector::text, ' ')::tsvector 
            FROM obj_type_value otv 
            WHERE otv.obj_id = o.id
        ) AS type_value_search,
        -- Get all steps and tags for filtering
        array_agg(DISTINCT os.step_id) FILTER (WHERE os.step_id IS NOT NULL) as step_ids,
        array_agg(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL) as tag_ids,
        -- Store IDs for later joins
        array_agg(DISTINCT otv.id) AS type_value_ids,
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
    GROUP BY o.id, o.name, o.description, o.id_string, o.creator_id, o.created_at, o.deleted_at
),
filtered_objects AS (
    SELECT od.id, od.name, od.description, od.id_string, od.creator_id, od.created_at, od.deleted_at, od.fact_count, od.first_fact_date, od.last_fact_date, od.obj_search, od.fact_search, od.type_value_search, od.step_ids, od.tag_ids, od.type_value_ids, od.all_type_values,
        -- Calculate search ranks for different sources
        CASE WHEN $2 = '' THEN 0
             ELSE ts_rank(obj_search, websearch_to_tsquery('english', $2)) * 3.0
        END AS obj_rank,
        CASE WHEN $2 = '' THEN 0
             ELSE ts_rank(fact_search, websearch_to_tsquery('english', $2))
        END AS fact_rank,
        CASE WHEN $2 = '' THEN 0
             ELSE ts_rank(type_value_search, websearch_to_tsquery('english', $2)) * 2.0
        END AS type_value_rank
    FROM object_data od
    WHERE 
        -- Filter by steps if array is provided
        ($3::uuid[] IS NULL OR 
         od.step_ids && $3::uuid[]) AND
        -- Filter by tags if array is provided
        ($4::uuid[] IS NULL OR 
         od.tag_ids && $4::uuid[]) AND
        -- Filter by type value criteria 1
        ($5::jsonb IS NULL OR 
         EXISTS (
             SELECT 1 FROM jsonb_array_elements(od.all_type_values) tv
             WHERE tv @> $5
         )) AND
        -- Filter by type value criteria 2
        ($6::jsonb IS NULL OR 
         EXISTS (
             SELECT 1 FROM jsonb_array_elements(od.all_type_values) tv
             WHERE tv @> $6
         )) AND
        -- Filter by type value criteria 3
        ($7::jsonb IS NULL OR 
         EXISTS (
             SELECT 1 FROM jsonb_array_elements(od.all_type_values) tv
             WHERE tv @> $7
         )) AND
        -- Enhanced text search condition including type_value_search
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
    (fo.obj_rank + fo.fact_rank + fo.type_value_rank) as search_rank,
    -- Add tags and type_values
    coalesce(
        (SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'color_schema', t.color_schema))
         FROM tag t
         WHERE t.id = ANY(fo.tag_ids)),
        '[]'
    ) AS tags,
    coalesce(
        (SELECT jsonb_agg(jsonb_build_object('id', otv.id, 'objectTypeId', otv.type_id, 'type_values', otv.type_values))
         FROM obj_type_value otv
         WHERE otv.id = ANY(fo.type_value_ids)),
        '[]'
    ) AS type_values
FROM filtered_objects fo
ORDER BY
    -- First by search rank if searching
    CASE WHEN $2 = '' THEN 0 ELSE (fo.obj_rank + fo.fact_rank + fo.type_value_rank) END DESC,
    -- Then by specified ordering
    CASE 
        WHEN $10 THEN -- When ascending
            CASE $8
                WHEN 'fact_count' THEN fo.fact_count::text
                WHEN 'created_at' THEN fo.created_at::text
                WHEN 'first_fact' THEN COALESCE(fo.first_fact_date::text, fo.created_at::text)
                WHEN 'last_fact' THEN COALESCE(fo.last_fact_date::text, fo.created_at::text)
                WHEN 'name' THEN fo.name
                WHEN 'type_value' THEN (
                    SELECT j.value::text
                    FROM jsonb_array_elements(fo.all_type_values) tv,
                         jsonb_each(tv) j
                    WHERE j.key = $9::text
                    LIMIT 1
                )
                ELSE fo.created_at::text
            END
    END ASC,
    CASE 
        WHEN NOT $10 THEN -- When descending
            CASE $8
                WHEN 'fact_count' THEN fo.fact_count::text
                WHEN 'created_at' THEN fo.created_at::text
                WHEN 'first_fact' THEN COALESCE(fo.first_fact_date::text, fo.created_at::text)
                WHEN 'last_fact' THEN COALESCE(fo.last_fact_date::text, fo.created_at::text)
                WHEN 'name' THEN fo.name
                WHEN 'type_value' THEN (
                    SELECT j.value::text
                    FROM jsonb_array_elements(fo.all_type_values) tv,
                         jsonb_each(tv) j
                    WHERE j.key = $9::text
                    LIMIT 1
                )
                ELSE fo.created_at::text
            END
    END DESC
LIMIT $11 OFFSET $12
` // for debugging

// OrderBy represents valid ordering options
type OrderBy string

const (
    OrderByFactCount OrderBy = "fact_count"
    OrderByCreatedAt OrderBy = "created_at"
    OrderByFirstFact OrderBy = "first_fact"
    OrderByLastFact  OrderBy = "last_fact"
    OrderByName      OrderBy = "name"
    OrderByTypeValue OrderBy = "type_value"
)

// IsValid checks if the ordering option is valid
func (o OrderBy) IsValid() bool {
    switch o {
    case OrderByFactCount, OrderByCreatedAt, OrderByFirstFact, 
         OrderByLastFact, OrderByName, OrderByTypeValue:
        return true
    default:
        return false
    }
}

type ListObjectsParams struct {
	pagination.Params
	OrgID            uuid.UUID
	SearchQuery      string
	StepIDs          []uuid.UUID          // Filter by steps
	TagIDs           []uuid.UUID          // Filter by tags
	TypeValueCriteria []json.RawMessage    // Filter by type values
	OrderBy          OrderBy
	TypeValueField   string
	Ascending        bool
}

type ObjectService struct {
	db *database.Queries
	debug bool
}

func NewObjectService(db *database.Queries, debug bool) *ObjectService {
	return &ObjectService{db: db, debug: debug}
}

func (s *ObjectService) ListObjects(ctx context.Context, params ListObjectsParams) (*pagination.PaginatedResult[database.ListObjectsAdvancedRow], error) {
	// Validate parameters
	if err := params.Validate(); err != nil {
			return nil, fmt.Errorf("invalid parameters: %w", err)
	}

	// Prepare type value criteria
	var criteria1, criteria2, criteria3 *json.RawMessage
	switch len(params.TypeValueCriteria) {
		case 3:
			criteria3 = &params.TypeValueCriteria[2]
			fallthrough
		case 2:
			criteria2 = &params.TypeValueCriteria[1]
			fallthrough
		case 1:
			criteria1 = &params.TypeValueCriteria[0]
	}

	// Prepare step IDs
	var stepIDs *[]uuid.UUID = &params.StepIDs

	// Prepare tag IDs
	var tagIDs *[]uuid.UUID = &params.TagIDs

	if s.debug {
		log.Printf("ListObjectsAdvanced parameters:\n"+
				"OrgID: %v\n"+
				"SearchQuery: %v\n"+
				"StepIDs: %v\n"+
				"TagIDs: %v\n"+
				"TypeValueCriteria1: %v\n"+
				"TypeValueCriteria2: %v\n"+
				"TypeValueCriteria3: %v\n"+
				"OrderBy: %v\n"+
				"TypeValueField: %v\n"+
				"Ascending: %v\n"+
				"Limit: %v\n"+
				"Offset: %v\n",
				params.OrgID,
				params.SearchQuery,
				stepIDs,
				tagIDs,
				criteria1,
				criteria2,
				criteria3,
				string(params.OrderBy),
				params.TypeValueField,
				params.Ascending,
				params.PageSize,
				params.GetOffset())

		// Debug: print interpolated query
		interpolatedQuery := database.InterpolateQuery(listObjectsAdvancedStmt,
				params.OrgID,
				params.SearchQuery,
				stepIDs,
				tagIDs,
				criteria1,
				criteria2,
				criteria3,
				string(params.OrderBy),
				params.TypeValueField,
				params.Ascending,
				params.PageSize,
				params.GetOffset())
		
		fmt.Printf("Interpolated query:\n%s", interpolatedQuery)
}
	
	// Get total count
	count, err := s.db.CountObjectsAdvanced(ctx, database.CountObjectsAdvancedParams{
		OrgID:             params.OrgID,
		Column2:       params.SearchQuery,
		Column3:          *stepIDs,
		Column4:           *tagIDs,
		Column5: *criteria1,
		Column6: *criteria2,
		Column7: *criteria3,
	})
	if err != nil {
			return nil, fmt.Errorf("error counting objects: %w", err)
	}

	// Get paginated results
	items, err := s.db.ListObjectsAdvanced(ctx, database.ListObjectsAdvancedParams{
			OrgID:             params.OrgID,
			Column2:       params.SearchQuery,
			Column3:          *stepIDs,
			Column4:           *tagIDs,
			Column5: *criteria1,
			Column6: *criteria2,
			Column7: *criteria3,
			Column8:          string(params.OrderBy),
			Column9:    params.TypeValueField,
			Column10:        params.Ascending,
			Limit:            params.PageSize,
			Offset:           params.GetOffset(),
	})
	if err != nil {
			return nil, fmt.Errorf("error listing objects: %w", err)
	}

	return &pagination.PaginatedResult[database.ListObjectsAdvancedRow]{
			Items:      items,
			TotalCount: count,
			Page:       params.Page,
			PageSize:   params.PageSize,
	}, nil
}


