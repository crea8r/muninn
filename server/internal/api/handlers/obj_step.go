package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type ObjStepHandler struct {
	ObjectModel *models.ObjectModel
}

func NewObjStepHandler(objectModel *models.ObjectModel) *ObjStepHandler {
	return &ObjStepHandler{ObjectModel: objectModel}
}

func (h *ObjStepHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		ObjID  uuid.UUID `json:"objId"`
		StepID uuid.UUID `json:"stepId"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)

	objStep, err := h.ObjectModel.CreateObjStep(r.Context(), input.ObjID, input.StepID, uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(objStep)
}

func (h *ObjStepHandler) SoftDelete(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid obj_step ID", http.StatusBadRequest)
		return
	}

	err = h.ObjectModel.SoftDeleteObjStep(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjStepHandler) HardDelete(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid obj_step ID", http.StatusBadRequest)
		return
	}

	err = h.ObjectModel.HardDeleteObjStep(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjStepHandler) UpdateSubStatus(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid obj_step ID", http.StatusBadRequest)
		return
	}

	var input struct {
		SubStatus int32 `json:"subStatus"`
	}

	err = json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = h.ObjectModel.UpdateObjStepSubStatus(r.Context(), id, input.SubStatus)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Println("Updated sub status ",input.SubStatus)

	w.WriteHeader(http.StatusOK)
}