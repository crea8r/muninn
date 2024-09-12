package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/crea8r/muninn/server/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type ObjectTypeHandler struct {
	DB *database.Queries
}

func NewObjectTypeHandler(db *database.Queries) *ObjectTypeHandler {
	return &ObjectTypeHandler{DB: db}
}

func (h *ObjectTypeHandler) CreateObjectType(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string          `json:"name"`
		Description string          `json:"description"`
		Fields      json.RawMessage `json:"fields"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	creator := r.Context().Value(middleware.CreatorContextKey).(database.Creator)

	objType, err := h.DB.CreateObjectType(r.Context(), database.CreateObjectTypeParams{
		Name:        req.Name,
		Description: req.Description,
		Fields:      req.Fields,
		CreatorID:   creator.ID,
	})

	if err != nil {
		http.Error(w, "Failed to create object type", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(objType)
}

func (h *ObjectTypeHandler) UpdateObjectType(w http.ResponseWriter, r *http.Request) {
	objTypeID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object type ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Name        string          `json:"name"`
		Description string          `json:"description"`
		Fields      json.RawMessage `json:"fields"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	objType, err := h.DB.UpdateObjectType(r.Context(), database.UpdateObjectTypeParams{
		ID:          objTypeID,
		Name:        req.Name,
		Description: req.Description,
		Fields:      req.Fields,
	})

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Object type not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to update object type", http.StatusInternalServerError)
		}
		return
	}

	json.NewEncoder(w).Encode(objType)
}

func (h *ObjectTypeHandler) DeleteObjectType(w http.ResponseWriter, r *http.Request) {
	objTypeID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object type ID", http.StatusBadRequest)
		return
	}

	rowsAffected, err := h.DB.DeleteObjectType(r.Context(), objTypeID)
	if err != nil {
		http.Error(w, "Failed to delete object type", http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Object type not found or is in use", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectTypeHandler) ListObjectTypes(w http.ResponseWriter, r *http.Request) {
	creator := r.Context().Value(middleware.CreatorContextKey).(database.Creator)

	query := r.URL.Query().Get("q")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize

	objectTypes, err := h.DB.ListObjectTypes(r.Context(), database.ListObjectTypesParams{
		OrgID:  creator.OrgID,
		Query:  query,
		Limit:  int32(pageSize),
		Offset: int32(offset),
	})

	if err != nil {
		http.Error(w, "Failed to list object types", http.StatusInternalServerError)
		return
	}

	totalCount, err := h.DB.CountObjectTypes(r.Context(), database.CountObjectTypesParams{
		OrgID: creator.OrgID,
		Query: query,
	})

	if err != nil {
		http.Error(w, "Failed to count object types", http.StatusInternalServerError)
		return
	}

	response := struct {
		ObjectTypes []database.ObjectType `json:"object_types"`
		TotalCount  int64                 `json:"total_count"`
		Page        int                   `json:"page"`
		PageSize    int                   `json:"page_size"`
	}{
		ObjectTypes: objectTypes,
		TotalCount:  totalCount,
		Page:        page,
		PageSize:    pageSize,
	}

	json.NewEncoder(w).Encode(response)
}