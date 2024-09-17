// handlers/funnel.go
package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/internal/models"
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
	fmt.Println(update)
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
	funnelID := r.URL.Query().Get("id")
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
	DeletedAt   sql.NullTime `json:"deleted_at"`
	OrgID       uuid.UUID    `json:"org_id"`
	ObjectCount int64        `json:"object_count"`
	Steps 			[]database.ListStepsByFunnelRow `json:"steps"`
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
		funnelWithSteps[i].DeletedAt = funnel.DeletedAt
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