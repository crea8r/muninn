// handlers/object.go
package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/pagination"
	"github.com/crea8r/muninn/server/internal/service"
	"github.com/google/uuid"
)

type AdvancedObjectHandler struct {
	objectService *service.ObjectService
}

func NewAdvancedObjectHandler(objectService *service.ObjectService) *AdvancedObjectHandler {
	return &AdvancedObjectHandler{objectService: objectService}
}

// errorResponse wraps error responses
type errorResponse struct {
	Error string `json:"error"`
}

// writeJSON is a helper to write JSON responses
func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// parseUUIDs helper function to parse comma-separated UUIDs
func parseUUIDs(input string) ([]uuid.UUID, error) {
	if input == "" {
		return nil, nil
	}

	var result []uuid.UUID
	for _, str := range strings.Split(input, ",") {
		id, err := uuid.Parse(strings.TrimSpace(str))
		if err != nil {
			return nil, fmt.Errorf("invalid UUID: %s", str)
		}
		result = append(result, id)
	}
	return result, nil
}

// parseTypeValueCriteria helper function to parse type value criteria
func parseTypeValueCriteria(r *http.Request) ([]json.RawMessage, error) {
	var criteria []json.RawMessage
	for i := 1; i <= 3; i++ {
		value := r.URL.Query().Get(fmt.Sprintf("type_value_criteria%d", i))
		if value == "" {
			continue
		}
		fmt.Println("value:", value)
		if !json.Valid([]byte(value)) {
			return nil, fmt.Errorf("invalid JSON in type_value_criteria%d", i)
		}

		criteria = append(criteria, json.RawMessage(value))
	}
	return criteria, nil
}

func (h *AdvancedObjectHandler) ListObjects(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Get organization ID from context (set by authentication middleware)
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := uuid.MustParse(claims.OrgID)

	// Parse pagination parameters
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(r.URL.Query().Get("page_size"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	// Parse step IDs
	stepIDs, err := parseUUIDs(r.URL.Query().Get("step_ids"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: fmt.Sprintf("invalid step IDs: %v", err)})
		return
	}

	// Parse tag IDs
	tagIDs, err := parseUUIDs(r.URL.Query().Get("tag_ids"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: fmt.Sprintf("invalid tag IDs: %v", err)})
		return
	}

	typeIDs, err := parseUUIDs(r.URL.Query().Get("type_ids"))
	if err != nil {
			writeJSON(w, http.StatusBadRequest, errorResponse{Error: fmt.Sprintf("invalid type IDs: %v", err)})
			return
	}

	// Parse type value criteria
	typeValueCriteria, err := parseTypeValueCriteria(r)
	if err != nil {
		fmt.Println("error in typeValueCriteria", err)
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: fmt.Sprintf("invalid type value criteria: %v", err)})
		return
	}

	// Parse ordering parameters
	orderBy := service.OrderBy(r.URL.Query().Get("order_by"))
	typeValueField := r.URL.Query().Get("type_value_field")
	// if ascending is not set, default to false (descending)
	ascending := r.URL.Query().Get("ascending") == "true"

	// Create service parameters
	params := service.ListObjectsParams{
		Params: pagination.Params{
				Page:     int32(page),
				PageSize: int32(pageSize),
		},
		OrgID:             orgID,
		SearchQuery:       r.URL.Query().Get("q"),
		StepIDs:           stepIDs,
		TagIDs:            tagIDs,
		TypeIDs:           typeIDs,
		TypeValueCriteria: typeValueCriteria,
		OrderBy:           orderBy,
		TypeValueField:    typeValueField,
		Ascending:    ascending,
}
	fmt.Println("params", params)

	// Get results from service
	result, err := h.objectService.ListObjects(ctx, params)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "invalid parameters" {
			status = http.StatusBadRequest
		}
		writeJSON(w, status, errorResponse{Error: err.Error()})
		return
	}

	// Write successful response
	writeJSON(w, http.StatusOK, result)
}