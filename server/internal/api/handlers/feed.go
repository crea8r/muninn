package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/google/uuid"
)

type FeedHandler struct {
	db *database.Queries
}

func NewFeedHandler(db *database.Queries) *FeedHandler {
	return &FeedHandler{db: db}
}

// ListFeeds handles GET requests to retrieve feed items
func (h *FeedHandler) ListFeeds(w http.ResponseWriter, r *http.Request) {
	// Extract creator ID from the context
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	
	// Get feed items
	feeds, err := h.db.GetFeed(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to retrieve feed items", http.StatusInternalServerError)
		return
	}

	// Prepare response
	type feedResponse struct {
		ID        uuid.UUID       `json:"id"`
		Content   json.RawMessage `json:"content"`
		Seen      bool            `json:"seen"`
		CreatedAt string          `json:"createdAt"`
	}

	response := make([]feedResponse, len(feeds))
	for i, feed := range feeds {
		response[i] = feedResponse{
			ID:        feed.ID,
			Content:   feed.Content,
			Seen:      feed.Seen,
			CreatedAt: feed.CreatedAt.String(),
		}
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// MarkFeedsAsSeen handles POST requests to mark feed items as seen
func (h *FeedHandler) MarkFeedsAsSeen(w http.ResponseWriter, r *http.Request) {
	
	// Parse request body
	var request struct {
		FeedIDs []string `json:"feedIds"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Convert string IDs to UUID
	feedIDs := make([]uuid.UUID, len(request.FeedIDs))
	for i, id := range request.FeedIDs {
		uuid, err := uuid.Parse(id)
		if err != nil {
			http.Error(w, "Invalid feed ID", http.StatusBadRequest)
			return
		}
		feedIDs[i] = uuid
	}

	// Mark feeds as seen
	err := h.db.MarkFeedAsSeen(r.Context(), feedIDs)
	if err != nil {
		http.Error(w, "Failed to mark feeds as seen", http.StatusInternalServerError)
		return
	}

	// Send success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Feeds marked as seen successfully"})
}