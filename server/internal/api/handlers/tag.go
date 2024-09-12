package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/internal/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type TagHandler struct {
	DB *database.Queries
}

func NewTagHandler(db *database.Queries) *TagHandler {
	return &TagHandler{DB: db}
}

func (h *TagHandler) CreateTag(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string          `json:"name"`
		Description sql.NullString  `json:"description"`
		ColorSchema json.RawMessage `json:"color_schema"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	creator := r.Context().Value(middleware.CreatorContextKey).(database.Creator)

	tag, err := h.DB.CreateTag(r.Context(), database.CreateTagParams{
		Name:        req.Name,
		Description: req.Description,
		ColorSchema: req.ColorSchema,
		OrgID:       creator.OrgID,
	})

	if err != nil {
		http.Error(w, "Failed to create tag", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(tag)
}

func (h *TagHandler) UpdateTag(w http.ResponseWriter, r *http.Request) {
	tagID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid tag ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Description sql.NullString  `json:"description"`
		ColorSchema json.RawMessage `json:"color_schema"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	tag, err := h.DB.UpdateTag(r.Context(), database.UpdateTagParams{
		ID:          tagID,
		Description: req.Description,
		ColorSchema: req.ColorSchema,
	})

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Tag not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to update tag", http.StatusInternalServerError)
		}
		return
	}

	json.NewEncoder(w).Encode(tag)
}

func (h *TagHandler) DeleteTag(w http.ResponseWriter, r *http.Request) {
	tagID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid tag ID", http.StatusBadRequest)
		return
	}

	rowsAffected, err := h.DB.DeleteTag(r.Context(), tagID)
	if err != nil {
		http.Error(w, "Failed to delete tag", http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Tag not found or is in use", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *TagHandler) ListTags(w http.ResponseWriter, r *http.Request) {
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

	tags, err := h.DB.ListTags(r.Context(), database.ListTagsParams{
		OrgID:  creator.OrgID,
		Column2:  query,
		Limit:  int32(pageSize),
		Offset: int32(offset),
	})

	if err != nil {
		http.Error(w, "Failed to list tags", http.StatusInternalServerError)
		return
	}

	totalCount, err := h.DB.CountTags(r.Context(), database.CountTagsParams{
		OrgID: creator.OrgID,
		Column2: query,
	})

	if err != nil {
		http.Error(w, "Failed to count tags", http.StatusInternalServerError)
		return
	}

	response := struct {
		Tags       []database.ListTagsRow `json:"tags"`
		TotalCount int64          `json:"total_count"`
		Page       int            `json:"page"`
		PageSize   int            `json:"page_size"`
	}{
		Tags:       tags,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	}

	json.NewEncoder(w).Encode(response)
}