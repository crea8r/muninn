// internal/api/handlers/external_handler.go
package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

type ExternalHandler struct {
	db *sql.DB
	queries *database.Queries
}

func NewExternalHandler(db *sql.DB, queries *database.Queries) *ExternalHandler {
	return &ExternalHandler{db: db, queries: queries}
}

type CreateExternalFactRequest struct {
	Aliases     []string  `json:"aliases"`      // List of id_strings or aliases to link
	Text        string    `json:"text"`         // Fact content
	HappenedAt  time.Time `json:"happened_at"`  // When the fact occurred
	Location    string    `json:"location"`     // Location of the fact
}

type CreateExternalFactResponse struct {
	FactID      uuid.UUID   `json:"fact_id"`
	ObjectIDs   []uuid.UUID `json:"object_ids"` // List of objects linked (both existing and newly created)
	Text        string      `json:"text"`       // Final text with object references
}

func (h *ExternalHandler) CreateFact(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	claims := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	creatorID := uuid.MustParse(claims.CreatorID)

	// Parse request
	var req CreateExternalFactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
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

	// Track objects we find or create
	type objectRef struct {
			ID      uuid.UUID
			Name    string
			Alias   string
	}
	
	var objects []objectRef
	var objectMentions []string

	// For each alias, find or create object
	for _, alias := range req.Aliases {
			// Try to find object by id_string or aliases
			obj, err := qtx.FindObjectByAliasOrIDString(ctx, database.FindObjectByAliasOrIDStringParams{
					IDString: alias,
					OrgID:    uuid.MustParse(claims.OrgID),
			})

			if err != nil {
					if err == sql.ErrNoRows {
							// Create new object if not found
							newObj, err := qtx.CreateObject(ctx, database.CreateObjectParams{
									Name:        alias, // Use alias as initial name
									Description: "",    // Empty initial description
									IDString:   alias,
									CreatorID:  creatorID,
							})
							if err != nil {
									http.Error(w, "Failed to create new object", http.StatusInternalServerError)
									return
							}
							objects = append(objects, objectRef{ID: newObj.ID, Name: alias, Alias: alias})
					} else {
							http.Error(w, "Database error", http.StatusInternalServerError)
							return
					}
			} else {
					objects = append(objects, objectRef{ID: obj.ID, Name: obj.Name, Alias: alias})
			}
	}

	// Create object mentions for the fact text
	for _, obj := range objects {
			mention := fmt.Sprintf("@[%s](object:%s)", obj.Name, obj.ID)
			objectMentions = append(objectMentions, mention)
	}

	// Combine mentions with original text
	fullText := strings.Join(objectMentions, " ") + " " + req.Text

	// Create fact
	fact, err := qtx.CreateFact(ctx, database.CreateFactParams{
			Text:       fullText,
			HappenedAt: sql.NullTime{Time: req.HappenedAt, Valid: !req.HappenedAt.IsZero()},
			Location:   req.Location,
			CreatorID:  creatorID,
	})
	if err != nil {
			http.Error(w, "Failed to create fact", http.StatusInternalServerError)
			return
	}
	objectIDs := make([]uuid.UUID, len(objects))
	for i, obj := range objects {
		objectIDs[i] = obj.ID
	}
	qtx.AddObjectsToFact(ctx, database.AddObjectsToFactParams{
			Column1:  objectIDs,
			FactID:   fact.ID,
			OrgID:    uuid.MustParse(claims.OrgID),
	});

	// Commit transaction
	if err := tx.Commit(); err != nil {
			http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
			return
	}

	response := CreateExternalFactResponse{
			FactID:    fact.ID,
			ObjectIDs: objectIDs,
			Text:      fullText,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

type UpsertObjectTypeValueRequest struct {
	ObjectID     string          `json:"object_id,omitempty"`
	ObjectTypeID string          `json:"object_type_id"`
	TypeValues   json.RawMessage `json:"type_values"`
	Aliases 		[]string        `json:"aliases,omitempty"`
}

type UpsertObjectTypeValueResponse struct {
	ID          uuid.UUID       `json:"id"`
	ObjectID    uuid.UUID       `json:"object_id"`
	TypeID      uuid.UUID       `json:"type_id"`
	TypeValues  json.RawMessage `json:"type_values"`
	CreatedAt   time.Time       `json:"created_at"`
	LastUpdated time.Time       `json:"last_updated"`
}

func (h *ExternalHandler) UpsertObjectTypeValue(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	// TODO: security check in the future make sure the user has access to the object
	claims := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := uuid.MustParse(claims.OrgID)
	creatorID := uuid.MustParse(claims.CreatorID)

	// Parse request body
	var req UpsertObjectTypeValueRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request format: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate and parse UUIDs
	objectID, err := uuid.Parse(req.ObjectID)
	if err != nil { // no objectId, now check for aliases
		aliases := req.Aliases
		if len(aliases) == 0 {
			http.Error(w, "Invalid object_id format", http.StatusBadRequest)
			return
		}
		r, err := h.queries.SyncObjectAliases(ctx, database.SyncObjectAliasesParams{
			Column1: aliases,
			OrgID:   orgID,
		});
		
		if err != nil && err != sql.ErrNoRows {
			http.Error(w, "Failed to sync object aliases", http.StatusInternalServerError)
			return
		}else if err == sql.ErrNoRows {
			idString := aliases[0]
			newObj, errCreateObj := h.queries.CreateObject(ctx, database.CreateObjectParams{
				Name:        idString, // Use alias as initial name
				Description: idString,
				IDString:   idString,
				CreatorID:  creatorID,
			})
			if(errCreateObj != nil){
				http.Error(w, "Failed to create object", http.StatusInternalServerError)
				return
			}
			objectID = newObj.ID
			aliasesWithoutId := aliases[1:]
			if len(aliases) > 1 {
				h.queries.UpdateObject(ctx, database.UpdateObjectParams{
					ID: objectID,
					Name: idString,
					Description: strings.Join(aliasesWithoutId, ", "),
					IDString: idString,
					Aliases: pq.StringArray(aliasesWithoutId),
				})
			}
		} else if err == nil {
			objectID = r.ID
		}
	}

	objectTypeID, err := uuid.Parse(req.ObjectTypeID)
	if err != nil {
		http.Error(w, "Invalid object_type_id format", http.StatusBadRequest)
		return
	}

	// Validate JSON format of type_values
	if !json.Valid(req.TypeValues) {
		http.Error(w, "Invalid type_values JSON format", http.StatusBadRequest)
		return
	}

	// Perform upsert
	result, err := h.queries.UpsertObjectTypeValue(ctx, database.UpsertObjectTypeValueParams{
		ObjID:      objectID,
		TypeID:     objectTypeID,
		TypeValues: req.TypeValues,
	})
	if err != nil {
			// Log the error for debugging
		log.Printf("Error upserting object type value: %v", err)
		
		if strings.Contains(err.Error(), "foreign key constraint") {
			http.Error(w, "Invalid object_id or object_type_id", http.StatusBadRequest)
			return
		}
		
		http.Error(w, "Failed to upsert object type value", http.StatusInternalServerError)
		return
	}

	// Prepare response
	response := UpsertObjectTypeValueResponse{
		ID:          result.ID,
		ObjectID:    result.ObjID,
		TypeID:      result.TypeID,
		TypeValues:  result.TypeValues,
		CreatedAt:   result.CreatedAt,
		LastUpdated: result.LastUpdated,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
