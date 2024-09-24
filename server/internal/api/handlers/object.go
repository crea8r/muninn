package handlers

import (
	"encoding/json"
	"io"
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
	
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	search := r.URL.Query().Get("search")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	offset := int32((page - 1) * pageSize)
	limit := int32(pageSize)
	
	objects, totalCount, err := h.ObjectModel.List(r.Context(), creator.OrgID, search, limit, offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
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

func (h *ObjectHandler) GetDetails(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreator(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	objectDetails, err := h.ObjectModel.GetDetails(r.Context(), id, creator.OrgID)
	if err != nil {
		http.Error(w, "Object not found", http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(objectDetails)
}

func (h *ObjectHandler) AddTag(w http.ResponseWriter, r *http.Request) {
	objectID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	var input struct {
		TagID uuid.UUID `json:"tagId"`
	}

	err = json.NewDecoder(r.Body).Decode(&input)
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

	err = h.ObjectModel.AddTag(r.Context(), objectID, input.TagID, creator.OrgID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectHandler) RemoveTag(w http.ResponseWriter, r *http.Request) {
	objectID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	tagID, err := uuid.Parse(chi.URLParam(r, "tagId"))
	if err != nil {
		http.Error(w, "Invalid tag ID", http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreator(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	err = h.ObjectModel.RemoveTag(r.Context(), objectID, tagID, creator.OrgID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectHandler) AddObjectTypeValue(w http.ResponseWriter, r *http.Request) {
	objectID, err := uuid.Parse(chi.URLParam(r, "id"))
	d,_ := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	var input struct {
		TypeID uuid.UUID          `json:"typeId"`
		Values json.RawMessage    `json:"values"`
	}

	err = json.Unmarshal(d, &input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreator(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}
	
	typeValue, err := h.ObjectModel.AddObjectTypeValue(r.Context(), objectID, input.TypeID, input.Values, creator.OrgID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(typeValue)
}

func (h *ObjectHandler) RemoveObjectTypeValue(w http.ResponseWriter, r *http.Request) {
	typeValueID, err := uuid.Parse(chi.URLParam(r, "typeValueId"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreator(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	err = h.ObjectModel.RemoveObjectTypeValue(r.Context(), typeValueID, creator.OrgID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectHandler) UpdateObjectTypeValue(w http.ResponseWriter, r *http.Request) {
	_, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	typeValueID, err := uuid.Parse(chi.URLParam(r, "typeValueId"))
	if err != nil {
		http.Error(w, "Invalid type value ID", http.StatusBadRequest)
		return
	}

	var input struct {
		Values json.RawMessage `json:"type_values"`
	}

	err = json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	OrgID := uuid.MustParse(claims.OrgID)

	updatedTypeValue, err := h.ObjectModel.UpdateObjectTypeValue(r.Context(), typeValueID, OrgID, input.Values)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedTypeValue)
}