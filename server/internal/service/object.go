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

type OrderDirection bool

const (
    OrderAsc  OrderDirection = true
    OrderDesc OrderDirection = false
)

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
    OrgID             uuid.UUID
    SearchQuery       string
    StepIDs           []uuid.UUID          // Filter by steps
    TagIDs            []uuid.UUID          // Filter by tags
    TypeIDs           []uuid.UUID          // Filter by object types
    TypeValueCriteria []json.RawMessage    // Filter by type values
    OrderBy           OrderBy
    TypeValueField    string
    Ascending        bool
    SubStatusFilter   []int32
}

// ListObjectsAdvancedParams represents the database query parameters
type ListObjectsAdvancedParams struct {
    OrgID             uuid.UUID         `json:"org_id"`
    SearchQuery       string            `json:"search_query"`
    StepIDs           []uuid.UUID       `json:"step_ids,omitempty"`
    TagIDs            []uuid.UUID       `json:"tag_ids,omitempty"`
    TypeIDs           []uuid.UUID       `json:"type_ids,omitempty"`
    TypeValueCriteria1 *json.RawMessage `json:"type_value_criteria1,omitempty"`
    TypeValueCriteria2 *json.RawMessage `json:"type_value_criteria2,omitempty"`
    TypeValueCriteria3 *json.RawMessage `json:"type_value_criteria3,omitempty"`
    OrderBy           string            `json:"order_by"`
    TypeValueField    string            `json:"type_value_field"`
    Ascending         bool              `json:"ascending"`
    Limit             int32             `json:"limit"`
    Offset            int32             `json:"offset"`
    SubStatusFilter   []int32            `json:"sub_status_filter,omitempty"`
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

    // Prepare arrays (nil if empty)
    var stepIDs, tagIDs, typeIDs []uuid.UUID
    var subStatusFilter []int32
    if len(params.StepIDs) > 0 {
        stepIDs = params.StepIDs
    }
    if len(params.TagIDs) > 0 {
        tagIDs = params.TagIDs
    }
    if len(params.TypeIDs) > 0 {
        typeIDs = params.TypeIDs
    }
    if len(params.SubStatusFilter) > 0 {
        subStatusFilter = params.SubStatusFilter
    }

    if s.debug {
        log.Printf("ListObjects params: stepIDs=%v, tagIDs=%v, typeIDs=%v", 
            stepIDs, tagIDs, typeIDs)
    }
    fmt.Println("search Query: ",params.SearchQuery)
    count, err := s.db.CountObjectsAdvanced(ctx, database.CountObjectsAdvancedParams{
        OrgID:             params.OrgID,
        Column2:       params.SearchQuery,
        Column3:          stepIDs,
        Column4:           tagIDs,
        Column5:          typeIDs,
        Column6: criteria1,
        Column7: criteria2,
        Column8: criteria3,
        Column9: subStatusFilter,
    })
    if err != nil {
        return nil, fmt.Errorf("error counting objects: %w", err)
    }
    items, err := s.db.ListObjectsAdvanced(ctx, database.ListObjectsAdvancedParams{
        OrgID:             params.OrgID,
        Column2:       params.SearchQuery,
        Column3:          stepIDs,
        Column4:           tagIDs,
        Column5:          typeIDs,
        Column6: criteria1,
        Column7: criteria2,
        Column8: criteria3,
        Column9:          string(params.OrderBy),
        Column10:    params.Ascending,
        Column11:        params.TypeValueField, 
        Limit:            params.PageSize,
        Offset:           params.GetOffset(),
        Column14: subStatusFilter,
    })
    if err != nil {
        return nil, fmt.Errorf("error listing objects: %w", err)
    }
    // loop through each item and JSON.Unmarshal the tags and type_values, steps
    for i, item := range items {
        if err := json.Unmarshal(item.Tags.([]byte), &items[i].Tags); err != nil {
            return nil, fmt.Errorf("error unmarshalling tags: %w", err)
        }
        if err := json.Unmarshal(item.TypeValues.([]byte), &items[i].TypeValues); err != nil {
            return nil, fmt.Errorf("error unmarshalling type values: %w", err)
        }
        
        if err := json.Unmarshal(item.Steps.([]byte), &items[i].Steps); err != nil {
            return nil, fmt.Errorf("error unmarshalling steps: %w", err)
        }
    }

    return &pagination.PaginatedResult[database.ListObjectsAdvancedRow]{
        Items:      items,
        TotalCount: count,
        Page:       params.Page,
        PageSize:   params.PageSize,
    }, nil
}


