package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"math/rand"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/google/uuid"
)

type TagObjectRequest struct {
	ObjectID string   `json:"object_id"`
	Tags     []string `json:"tags"`
}

type TagObjectResponse struct {
	ObjectID string      `json:"object_id"`
	Tags     []TagDetail `json:"tags"`
}

type TagDetail struct {
	ID          string          `json:"id"`
	Name        string          `json:"name"`
	ColorSchema json.RawMessage `json:"color_schema"`
	IsNew       bool           `json:"is_new"`
}

func (h *ExternalHandler) TagObject(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	claims := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := uuid.MustParse(claims.OrgID)

	// Parse request
	var req TagObjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate object ID
	objectID, err := uuid.Parse(req.ObjectID)
	if err != nil {
		http.Error(w, "Invalid object_id format", http.StatusBadRequest)
		return
	}

	// Start transaction
	tx, err := h.db.BeginTx(ctx, nil)
	if err != nil {
		http.Error(w, "Failed to start transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	qtx := h.queries.WithTx(tx)

	// Process each tag
	var processedTags []TagDetail
	var colorPairs = []string{
    `{"background": "#1E1E1E", "text": "#FFFFFF"}`,
    `{"background": "#FF5733", "text": "#1C1C1C"}`,
    `{"background": "#4CAF50", "text": "#FFFFFF"}`,
    `{"background": "#212121", "text": "#FFC107"}`,
    `{"background": "#007BFF", "text": "#FFFFFF"}`,
    `{"background": "#F8F9FA", "text": "#343A40"}`,
    `{"background": "#6C757D", "text": "#F8F9FA"}`,
    `{"background": "#E2E8F0", "text": "#1A202C"}`,
    `{"background": "#000000", "text": "#FFD700"}`,
    `{"background": "#FFEBEE", "text": "#C62828"}`,
	}

	for _, tagName := range req.Tags {
		// take a random color pair
		colorPair := colorPairs[rand.Intn(len(colorPairs))]
		defaultColorSchema := json.RawMessage(colorPair)
		// Normalize tag name
		normalizedName := strings.TrimSpace(strings.ToLower(tagName))
		if normalizedName == "" {
			continue
		}

		// Try to find existing tag
		tag, err := qtx.FindTagByNormalizedName(ctx, database.FindTagByNormalizedNameParams{
			Lower: normalizedName,
			OrgID:         orgID,
		})

		var tagID uuid.UUID
		var isNewTag bool

		if err == sql.ErrNoRows {
			// Create new tag
			newTag, err := qtx.CreateTag(ctx, database.CreateTagParams{
				Name:        tagName, // Keep original case for display
				Description: "",      // Empty description for auto-created tags
				ColorSchema: defaultColorSchema,
				OrgID:      orgID,
			})
			if err != nil {
				http.Error(w, "Failed to create tag", http.StatusInternalServerError)
				return
			}
			tagID = newTag.ID
			isNewTag = true
		} else if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		} else {
			tagID = tag.ID
			isNewTag = false
		}

		// Try to link tag to object
		err = qtx.AddTagToObject(ctx, database.AddTagToObjectParams{
			ObjID:  objectID,
			TagID:  tagID,
			OrgID:  orgID,
		})
		if err != nil {
			// Ignore duplicate tag links
			if !strings.Contains(err.Error(), "duplicate key value") {
				http.Error(w, "Failed to link tag to object", http.StatusInternalServerError)
				return
			}
		}

		// Add to processed tags
		processedTags = append(processedTags, TagDetail{
			ID:          tagID.String(),
			Name:        tagName, // Original case
			ColorSchema: defaultColorSchema,
			IsNew:       isNewTag,
		})
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
			http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
			return
	}

	// Send response
	response := TagObjectResponse{
			ObjectID: req.ObjectID,
			Tags:     processedTags,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}