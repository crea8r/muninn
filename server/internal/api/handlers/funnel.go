// handlers/funnel.go
package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/internal/models"
	"github.com/crea8r/muninn/server/internal/utils"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type FunnelHandler struct {
	db *database.Queries
}

func NewFunnelHandler(db *database.Queries) *FunnelHandler {
	return &FunnelHandler{db: db}
}

func (h *FunnelHandler) CreateFunnel(w http.ResponseWriter, r *http.Request) {
	var funnel models.Funnel
	if err := json.NewDecoder(r.Body).Decode(&funnel); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creatorID := uuid.MustParse(claims.CreatorID)

	funnelID := uuid.New()
	createdFunnel, err := h.db.CreateFunnel(ctx, database.CreateFunnelParams{
		ID:          funnelID,
		Name:        funnel.Name,
		Description: funnel.Description,
		CreatorID:   creatorID,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for _, step := range funnel.Steps {
		_, err := h.db.CreateStep(ctx, database.CreateStepParams{
			ID:         uuid.New(),
			FunnelID:   funnelID,
			Name:       step.Name,
			Definition: step.Definition,
			Example:    step.Example,
			Action:     step.Action,
			StepOrder:  int32(step.StepOrder),
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	json.NewEncoder(w).Encode(createdFunnel)
}

func (h *FunnelHandler) UpdateFunnel(w http.ResponseWriter, r *http.Request) {
	var update models.FunnelUpdate
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	ctx := r.Context()

	// Update funnel
	updatedFunnel, err := h.db.UpdateFunnel(ctx, database.UpdateFunnelParams{
		ID:          uuid.MustParse(update.ID),
		Name:        update.Name,
		Description: update.Description,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Create new steps
	for _, step := range update.StepsCreate {
		newUUIDStepID := uuid.New()
		for oldStepID, newStepID := range update.StepMapping {
			if newStepID == step.ID {
				update.StepMapping[oldStepID] = newUUIDStepID.String()
			}
		}
		_, err := h.db.CreateStep(ctx, database.CreateStepParams{
			ID:         newUUIDStepID,
			FunnelID:   uuid.MustParse(update.ID),
			Name:       step.Name,
			Definition: step.Definition,
			Example:    step.Example,
			Action:     step.Action,
			StepOrder:  int32(step.StepOrder),
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
	// Update existing steps
	for _, step := range update.StepsUpdate {
		_, err := h.db.UpdateStep(ctx, database.UpdateStepParams{
			ID:         uuid.MustParse(step.ID),
			Name:       step.Name,
			Definition: step.Definition,
			Example:    step.Example,
			Action:     step.Action,
			StepOrder:  int32(step.StepOrder),
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
	// Delete steps
	for _, stepID := range update.StepsDelete {
		err := h.db.DeleteStep(ctx, uuid.MustParse(stepID))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
	// Update obj_step mappings
	for oldStepID, newStepID := range update.StepMapping {
		err := h.db.UpdateObjStep(ctx, database.UpdateObjStepParams{
			StepID:    uuid.MustParse(oldStepID),
			StepID_2: uuid.MustParse(newStepID),
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
	json.NewEncoder(w).Encode(updatedFunnel)
}

func (h *FunnelHandler) DeleteFunnel(w http.ResponseWriter, r *http.Request) {
	funnelID := chi.URLParam(r, "id")
	if funnelID == "" {
		http.Error(w, "Missing funnel ID", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	err := h.db.DeleteFunnel(ctx, uuid.MustParse(funnelID))
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Funnel not found or cannot be deleted due to existing references", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type ListFunnelsRowWithStep struct {
	ID          uuid.UUID    `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	CreatorID   uuid.UUID    `json:"creator_id"`
	CreatedAt   time.Time    `json:"created_at"`
	DeletedAt   utils.NullTime `json:"deleted_at"`
	OrgID       uuid.UUID    `json:"org_id"`
	ObjectCount int64        `json:"object_count"`
	Steps 			[]database.ListStepsByFunnelRow `json:"steps"`
}

type FunnelViewResponse struct {
	Funnel  database.GetFunnelRow        `json:"funnel"`
	Steps   []StepWithObjects      `json:"steps"`
}

type StepWithObjects struct {
	Step 				database.ListStepsByFunnelRow `json:"step"`
	Objects     []ObjectSummary `json:"objects"`
	TotalCount  int32           `json:"totalCount"`
	CurrentPage int32           `json:"currentPage"`
}

type ObjectSummary struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Tags        json.RawMessage `json:"tags"`
}

func (h *FunnelHandler) ListFunnels(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := claims.OrgID

	query := r.URL.Query().Get("q")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	funnels, err := h.db.ListFunnels(ctx, database.ListFunnelsParams{
		OrgID:  uuid.MustParse(orgID),
		Column2:  query,
		Limit:  int32(pageSize),
		Offset: int32((page - 1) * pageSize),
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	totalCount, err := h.db.CountFunnels(ctx, database.CountFunnelsParams{
		OrgID: uuid.MustParse(orgID),
		Column2: query,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	funnelWithSteps := make([]ListFunnelsRowWithStep, len(funnels))
	for i, funnel := range funnels {
		steps, err := h.db.ListStepsByFunnel(ctx, funnel.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		funnelWithSteps[i].ID = funnel.ID
		funnelWithSteps[i].Name = funnel.Name
		funnelWithSteps[i].Description = funnel.Description
		funnelWithSteps[i].CreatorID = funnel.CreatorID
		funnelWithSteps[i].CreatedAt = funnel.CreatedAt
		funnelWithSteps[i].DeletedAt = utils.NullTime{NullTime: funnel.DeletedAt}
		funnelWithSteps[i].OrgID = funnel.OrgID
		funnelWithSteps[i].ObjectCount = funnel.ObjectCount
		funnelWithSteps[i].Steps = steps
	}

	response := struct {
		Funnels    []ListFunnelsRowWithStep `json:"funnels"`
		TotalCount int64             `json:"totalCount"`
		Page       int               `json:"page"`
		PageSize   int               `json:"pageSize"`
	}{
		Funnels:    funnelWithSteps,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	}

	json.NewEncoder(w).Encode(response)
}

// GetFunnel handles GET requests to retrieve a funnel by ID
func (h *FunnelHandler) GetFunnel(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	// Extract the funnel ID from the URL parameters
	funnelIDStr := chi.URLParam(r, "id")
	funnelID, err := uuid.Parse(funnelIDStr)
	if err != nil {
		http.Error(w, "Invalid funnel ID", http.StatusBadRequest)
		return
	}
	params := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgId := uuid.MustParse(params.OrgID)
	
	// Retrieve the funnel from the database
	funnel, err := h.db.GetFunnel(ctx, funnelID)
	if err != nil {
		http.Error(w, "Error fetching funnel", http.StatusInternalServerError)
		return
	}

	// Check if the creator has access to this funnel
	if funnel.OrgID != orgId {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Fetch steps for the funnel
	steps, err := h.db.ListStepsByFunnel(ctx, funnelID)
	if err != nil {
		http.Error(w, "Error fetching funnel steps", http.StatusInternalServerError)
		return
	}

	// Assign steps to the funnel
	funnelWithStep := ListFunnelsRowWithStep{
		ID:          funnel.ID,
		Name:        funnel.Name,
		Description: funnel.Description,
		CreatorID:   funnel.CreatorID,
		CreatedAt:   funnel.CreatedAt,
		DeletedAt:   utils.NullTime{NullTime: funnel.DeletedAt},
		OrgID:       funnel.OrgID,
		ObjectCount: funnel.ObjectCount,
		Steps:  steps,
	}

	// Set the Content-Type header and encode the funnel as JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(funnelWithStep); err != nil {
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}

func (h *FunnelHandler) GetFunnelView(w http.ResponseWriter, r *http.Request) {
	funnelID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid funnel ID", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	// Fetch funnel details
	funnel, err := h.db.GetFunnel(ctx, funnelID)
	if err != nil {
		http.Error(w, "Failed to fetch funnel", http.StatusInternalServerError)
		return
	}

	// Fetch steps for the funnel
	steps, err := h.db.ListStepsByFunnel(ctx, funnelID)
	if err != nil {
		http.Error(w, "Failed to fetch funnel steps", http.StatusInternalServerError)
		return
	}

	stepsWithObjects := make([]StepWithObjects, len(steps))

	for i, step := range steps {
		pageStr := r.URL.Query().Get("page_" + step.ID.String())
		page, _ := strconv.Atoi(pageStr)
		if page == 0 {
			page = 1
		}

		searchQuery := r.URL.Query().Get("search_" + step.ID.String())

		objects, totalCount, err := h.getObjectsForStep(ctx, step.ID, page, searchQuery)
		if err != nil {
			http.Error(w, "Failed to fetch objects for step", http.StatusInternalServerError)
			return
		}

		stepsWithObjects[i] = StepWithObjects{
			Step:        step,
			Objects:     objects,
			TotalCount:  int32(totalCount),
			CurrentPage: int32(page),
		}
	}

	response := FunnelViewResponse{
		Funnel: funnel,
		Steps:  stepsWithObjects,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *FunnelHandler) getObjectsForStep(ctx context.Context, stepID uuid.UUID, page int, searchQuery string) ([]ObjectSummary, int64, error) {
	limit := 20 // Objects per page
	offset := (page - 1) * limit

	// Create a new query to fetch objects for a specific step with pagination and search
	objects, err := h.db.GetObjectsForStep(ctx, database.GetObjectsForStepParams{
		StepID:      stepID,
		Column2: searchQuery,
		Limit:       int32(limit),
		Offset:      int32(offset),
	})
	if err != nil {
		return nil, 0, err
	}

	// Count total objects for the step (for pagination)
	totalCount, err := h.db.CountObjectsForStep(ctx, database.CountObjectsForStepParams{
		StepID:      stepID,
		Column2: searchQuery,
	})
	if err != nil {
		return nil, 0, err
	}

	objectSummaries := make([]ObjectSummary, len(objects))
	for i, obj := range objects {
		var tags json.RawMessage
		tagsBytes, ok := obj.Tags.([]byte);
		if !ok {
			fmt.Println("Cannot convert objects to bytes: ");
		}
		err = json.Unmarshal(tagsBytes, &tags);
		if err != nil {
			fmt.Println("Cannot marshal objects: ", err);
		}
		objectSummaries[i] = ObjectSummary{
			ID:          obj.ID,
			Name:        obj.Name,
			Description: obj.Description,
			Tags:        tags,
		}
	}

	return objectSummaries, totalCount, nil
}