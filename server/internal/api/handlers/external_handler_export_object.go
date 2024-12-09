package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/google/uuid"
)

type NormalizedObjectData struct {
	ID          string          `json:"id"`
	ObjectName  string          `json:"object_name"`
	CreatedAt   time.Time       `json:"created_at"`
	ContactData json.RawMessage `json:"contact_data"`
}

type ListNormalizedObjectsRequest struct {
	CreatedAfter *time.Time  `json:"created_after,omitempty"`
	ObjectIDs    []uuid.UUID `json:"object_ids,omitempty"`
}

type ListNormalizedObjectsResponse struct {
	Objects []NormalizedObjectData `json:"objects"`
}

// ListObjectsWithNormalizedData returns objects with standardized contact information
func (h *ExternalHandler) ListObjectsWithNormalizedData(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	claims := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := uuid.MustParse(claims.OrgID)

	var req ListNormalizedObjectsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println("ListObjectsWithNormalizedData*Invalid request body");
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	createdAfter := req.CreatedAfter
	objectIDs := req.ObjectIDs

	if len(objectIDs) == 0 && createdAfter == nil {
		http.Error(w, "Must provide at least one of created_after or object_ids", http.StatusBadRequest)
		return
	}
	// Query the database with normalized data
	objects, err := h.queries.ListObjectsWithNormalizedData(ctx, database.ListObjectsWithNormalizedDataParams{
		ID:        orgID,
		Column2: func() time.Time {
			if createdAfter != nil {
				return *createdAfter
			}
			return time.Time{}
		}(),
		Column3:    objectIDs,
	})
	if err != nil {
		log.Printf("Error fetching normalized objects: %v", err)
		http.Error(w, "Failed to fetch objects", http.StatusInternalServerError)
		return
	}

	// Convert database objects to response format
	normalizedObjects := make([]NormalizedObjectData, len(objects))
	for i, obj := range objects {
		normalizedObjects[i] = NormalizedObjectData{
			ID:          obj.ID.String(),
			ObjectName:  obj.ObjectName,
			CreatedAt:   obj.CreatedAt,
			ContactData: obj.ContactData,
		}
	}
	// get the now
	latest := time.Now()
	if len(objects) > 0 {
		latest = objects[len(objects)-1].CreatedAt
		// add a minutes to the latest
		latest = latest.Add(time.Minute)
	}
	response := struct {
		Objects []NormalizedObjectData `json:"objects"`
		Latest time.Time `json:"latest"`
	}	{
		Objects: normalizedObjects,
		Latest: latest,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}