package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type ObjectHandler struct {
	ObjectModel *models.ObjectModel
	DB *database.Queries
}

func NewObjectHandler(objectModel *models.ObjectModel, db *database.Queries) *ObjectHandler {
	return &ObjectHandler{ObjectModel: objectModel, DB: db}
}

func (h *ObjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		IDString    string `json:"idString"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreator(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	object, err := h.ObjectModel.Create(r.Context(), input.Name, input.Description, input.IDString, creator.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(object)
}

func (h *ObjectHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		IDString    string `json:"idString"`
	}

	err = json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	object, err := h.ObjectModel.Update(r.Context(), id, input.Name, input.Description, input.IDString)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(object)
}

func (h *ObjectHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	err = h.ObjectModel.Delete(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectHandler) List(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreator(r.Context(), uuid.MustParse(claims.CreatorID))
	fmt.Println("creator: ",creator)
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	search := r.URL.Query().Get("search")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	fmt.Println("search: ",search)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	offset := int32((page - 1) * pageSize)
	limit := int32(pageSize)
	fmt.Println("before ObjectModel.List: ")
	objects, totalCount, err := h.ObjectModel.List(r.Context(), creator.OrgID, search, limit, offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Println("after ObjectModel.List: ",objects)
	response := struct {
		Objects    []models.Object `json:"objects"`
		TotalCount int64           `json:"totalCount"`
		Page       int             `json:"page"`
		PageSize   int             `json:"pageSize"`
	}{
		Objects:    objects,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}