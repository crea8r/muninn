// handlers/metrics.go
package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/service"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// MetricsResponse represents the structure for daily activity metrics response
type MetricsResponse struct {
	CreatorID   string           `json:"creatorId"`
	CreatorName string           `json:"creatorName"`
	Metrics     []service.DailyMetrics   `json:"metrics"`
	Summary     service.MetricsSummary   `json:"summary"`
}

type MetricsHandler struct {
	metricsService *service.MetricsService
}

func NewMetricsHandler(metricsService *service.MetricsService) *MetricsHandler {
	return &MetricsHandler{
		metricsService: metricsService,
	}
}

// GetCreatorMetrics handles requests for creator activity metrics
func (h *MetricsHandler) GetCreatorMetrics(w http.ResponseWriter, r *http.Request) {
	// Get requester's claims from context
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	requesterOrgID := uuid.MustParse(claims.OrgID)
	fmt.Println("requesterOrgID:", requesterOrgID)
	// Get target creator ID from URL
	targetCreatorID := chi.URLParam(r, "creatorId")
	if targetCreatorID == "" {
		http.Error(w, "creator ID is required", http.StatusBadRequest)
		return
	}

	targetCreatorUUID, err := uuid.Parse(targetCreatorID)
	if err != nil {
		http.Error(w, "invalid creator ID format", http.StatusBadRequest)
		return
	}

	// Get metrics
	metrics, err := h.metricsService.GetCreatorMetrics(r.Context(), requesterOrgID, targetCreatorUUID)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrUnauthorized):
			http.Error(w, "unauthorized access to creator metrics", http.StatusForbidden)
		case errors.Is(err, service.ErrNotFound):
			http.Error(w, "creator not found", http.StatusNotFound)
		default:
			fmt.Println("error:", err)
			http.Error(w, "internal server error", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}

// GetTeamMetrics handles requests for team-wide activity metrics
func (h *MetricsHandler) GetTeamMetrics(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := uuid.MustParse(claims.OrgID)

	metrics, err := h.metricsService.GetTeamMetrics(r.Context(), orgID)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}