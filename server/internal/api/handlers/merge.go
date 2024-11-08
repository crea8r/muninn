package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/google/uuid"
)

type MergeObjectsHandler struct {
	db *sql.DB
	queries *database.Queries
}

func NewMergeObjectsHandler(db *sql.DB) *MergeObjectsHandler {
	return &MergeObjectsHandler{
        queries: database.New(db), 
        db: db,
    }
}

type ObjectTypeValue struct {
	TypeID     uuid.UUID       `json:"typeId"`
	TypeValues json.RawMessage `json:"typeValues"`
}

type MergeObjectsRequest struct {
	TargetObjectID  uuid.UUID        `json:"target_object_id"`
	SourceObjectIDs []uuid.UUID      `json:"source_object_ids"`
	TypeValues     []ObjectTypeValue `json:"type_values,omitempty"`
	Name 				 string            	 `json:"name"`
	Description      string          `json:"description,omitempty"`
	IDString				 string          `json:"id_string"`
}

func (h *MergeObjectsHandler) MergeObjects(w http.ResponseWriter, r *http.Request) {
    // Parse request
    var req MergeObjectsRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
    }

    // Get creator ID from context
    claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
    creatorID := uuid.MustParse(claims.CreatorID)

    // Create array of all objects including target
    allObjects := append([]uuid.UUID{req.TargetObjectID}, req.SourceObjectIDs...)

    // Validate merge request
    validation, err := h.queries.ValidateMergeObjects(r.Context(), database.ValidateMergeObjectsParams{
        Column1: allObjects,
        ID:     creatorID,
    });
    if err != nil {
			http.Error(w, "Error validating merge request", http.StatusInternalServerError)
			return
    }

    if validation.ValidationResult != "valid" {
			http.Error(w, validation.ValidationResult, http.StatusBadRequest)
			return
    }

    // Begin transaction
    tx, err := h.db.BeginTx(r.Context(), nil)
    if err != nil {
        http.Error(w, "Error starting transaction", http.StatusInternalServerError)
        return
    }
    defer tx.Rollback()

    _,err = h.queries.UpdateObject(r.Context(), database.UpdateObjectParams{
        ID:         req.TargetObjectID,
        Name:       req.Name,
        Description: req.Description,
        IDString:   req.IDString,
    });

    if err != nil {
        http.Error(w, fmt.Sprintf("Error updating object: %v", err), http.StatusInternalServerError)
        return
    }

    // Handle object type values if provided
    for _, typeValue := range req.TypeValues {
        _, err := h.queries.UpsertObjectTypeValue(r.Context(), database.UpsertObjectTypeValueParams{
            ObjID:      req.TargetObjectID,
            TypeID:     typeValue.TypeID,
            TypeValues: typeValue.TypeValues,
        })
        if err != nil {
            http.Error(w, fmt.Sprintf("Error updating object type value: %v", err), http.StatusInternalServerError)
            return
        }
    }

    // Perform merge
    err = h.queries.MergeObjects(r.Context(), database.MergeObjectsParams{
        TargetObjectID:  req.TargetObjectID,
        SourceObjectIds: req.SourceObjectIDs,
        CreatorID:      creatorID,
    })
    if err != nil {
        http.Error(w, fmt.Sprintf("Error performing merge: %v", err), http.StatusInternalServerError)
        return
    }

    // Commit transaction
    if err = tx.Commit(); err != nil {
        http.Error(w, "Error committing transaction", http.StatusInternalServerError)
        return
    }

    // Return success response
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "message": "Objects merged successfully",
    })
}