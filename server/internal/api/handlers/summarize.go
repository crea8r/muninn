package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/google/uuid"
)

type SummarizeHandler struct {
	db *database.Queries
}

func NewSummarizeHandler(db *database.Queries) *SummarizeHandler {
	return &SummarizeHandler{db: db}
}

// ListFeeds handles GET requests to retrieve feed items
func (h *SummarizeHandler) PersonalSummarize(w http.ResponseWriter, r *http.Request) {
	// Extract creator ID from the context
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	unseen, err := h.db.CountUnseenFeed(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to count unseen feed items", http.StatusInternalServerError)
		return
	}
	ongoingTask, err := h.db.CountOngoingTask(r.Context(), uuid.NullUUID{Valid: true, UUID: uuid.MustParse(claims.CreatorID)})
	if err != nil {
		http.Error(w, "Failed to count ongoing task", http.StatusInternalServerError)
		return
	}

	// Prepare response
	type SummarizeResponse struct {
		Unseen 		int64 `json:"unseen"`
		OngoingTask int64 `json:"ongoingTask"`
	}

	response := SummarizeResponse{
		Unseen: unseen,
		OngoingTask: ongoingTask,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// TODO: summarize for an organisation
// TODO: summarize for an object
// TODO: summarize for a funnel
// TODO: summarize for an object type