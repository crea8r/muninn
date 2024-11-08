// service/metrics.go
package service

import (
	"context"
	"errors"
	"time"

	"github.com/crea8r/muninn/server/internal/database"
	"github.com/google/uuid"
)

var (
	ErrUnauthorized = errors.New("unauthorized access")
	ErrNotFound     = errors.New("creator not found")
)

// DailyMetrics represents metrics for a single day
type DailyMetrics struct {
	Date                  time.Time `json:"date"`
	FactsCreated         int64     `json:"factsCreated"`
	FactObjectsInvolved  int64     `json:"factObjectsInvolved"`
	TasksTotal          int64     `json:"tasksTotal"`
	TasksCompleted      int64     `json:"tasksCompleted"`
	TaskObjectsInvolved int64     `json:"taskObjectsInvolved"`
	ObjectsCreated      int64     `json:"objectsCreated"`
	TypeValuesAdded     int64     `json:"typeValuesAdded"`
	TagsAdded           int64     `json:"tagsAdded"`
	ObjectsMovedInFunnels int64   `json:"objectsMovedInFunnels"`
	FunnelStepsInvolved  int64    `json:"funnelStepsInvolved"`
	FunnelsCreated      int64     `json:"funnelsCreated"`
	StepsCreated        int64     `json:"stepsCreated"`
	StepsUpdated        int64     `json:"stepsUpdated"`
	StepsModified       int64     `json:"stepsModified"`
	TypesCreated        int64     `json:"typesCreated"`
	TypesUsed           int64     `json:"typesUsed"`
	TypesUpdated        int64     `json:"typesUpdated"`
	ActivityScore       float64   `json:"activityScore"`
}

// MetricsSummary provides aggregated metrics for the entire period
type MetricsSummary struct {
	TotalActivityScore     float64 `json:"totalActivityScore"`
	AverageActivityScore   float64 `json:"averageActivityScore"`
	TotalTasksCompleted    int64   `json:"totalTasksCompleted"`
	TotalObjectsProcessed  int64   `json:"totalObjectsProcessed"`
	MostActiveDate         string  `json:"mostActiveDate"`
}

// MetricsResponse represents the structure for daily activity metrics response
type MetricsResponse struct {
	CreatorID   string           `json:"creatorId"`
	CreatorName string           `json:"creatorName"`
	Metrics     []DailyMetrics   `json:"metrics"`
	Summary     MetricsSummary   `json:"summary"`
}

type MetricsService struct {
	db *database.Queries
}

func NewMetricsService(db *database.Queries) *MetricsService {
	return &MetricsService{
		db: db,
	}
}

// GetCreatorMetrics retrieves activity metrics for a specific creator
func (s *MetricsService) GetCreatorMetrics(ctx context.Context, requesterOrgID, targetCreatorID uuid.UUID) (*MetricsResponse, error) {
	// First, verify that target creator belongs to the same organization
	creator, err := s.db.GetCreatorByID(ctx, targetCreatorID)
	if err != nil {
		return nil, ErrNotFound
	}
	
	if creator.OrgID != requesterOrgID {
		return nil, ErrUnauthorized
	}

	// Get the daily metrics
	dailyMetrics, err := s.db.GetCreatorDailyActivity(ctx, targetCreatorID)
	if err != nil {
		return nil, err
	}

	// Transform database results into response format
	metrics := make([]DailyMetrics, len(dailyMetrics))
	var summary MetricsSummary
	var maxScore float64
	var maxScoreDate string

	for i, m := range dailyMetrics {
		// ActivityDate is now a time.Time directly from the database
		metrics[i] = DailyMetrics{
			Date:                  m.ActivityDate,  // No conversion needed
			FactsCreated:         m.FactsCreated,
			FactObjectsInvolved:  m.FactObjectsInvolved,
			TasksTotal:           m.TasksTotal,
			TasksCompleted:       m.TasksCompleted,
			TaskObjectsInvolved:  m.TaskObjectsInvolved,
			ObjectsCreated:       m.ObjectsCreated,
			TypeValuesAdded:      m.TypeValuesAdded,
			TagsAdded:            m.TagsAdded,
			ObjectsMovedInFunnels: m.ObjectsMovedInFunnels,
			FunnelStepsInvolved:   m.FunnelStepsInvolved,
			FunnelsCreated:       m.FunnelsCreated,
			StepsCreated:         m.StepsCreated,
			StepsUpdated:         m.StepsUpdated,
			StepsModified:        m.StepsModified,
			TypesCreated:         m.TypesCreated,
			TypesUsed:            m.TypesUsed,
			TypesUpdated:         m.TypesUpdated,
			ActivityScore:        m.DailyActivityScore,
		}

		// Update summary data
		summary.TotalActivityScore += m.DailyActivityScore
		summary.TotalTasksCompleted += m.TasksCompleted
		summary.TotalObjectsProcessed += m.ObjectsCreated + m.FactObjectsInvolved + m.TaskObjectsInvolved

		// Track highest activity date
		if m.DailyActivityScore > maxScore {
			maxScore = m.DailyActivityScore
			maxScoreDate = m.ActivityDate.Format("2006-01-02")
		}
	}

	// Calculate averages
	if len(metrics) > 0 {
		summary.AverageActivityScore = summary.TotalActivityScore / float64(len(metrics))
	}
	summary.MostActiveDate = maxScoreDate

	return &MetricsResponse{
		CreatorID:   targetCreatorID.String(),
		CreatorName: creator.Username,
		Metrics:     metrics,
		Summary:     summary,
	}, nil
}

// GetTeamMetrics retrieves activity metrics for all team members
func (s *MetricsService) GetTeamMetrics(ctx context.Context, orgID uuid.UUID) (map[string]*MetricsResponse, error) {
	// Get all active creators in the organization
	creators, err := s.db.ListOrgMembers(ctx, database.ListOrgMembersParams{
		OrgID: orgID,
	});
	if err != nil {
		return nil, err
	}

	// Get metrics for each creator
	teamMetrics := make(map[string]*MetricsResponse)
	for _, creator := range creators {
		metrics, err := s.GetCreatorMetrics(ctx, orgID, creator.ID)
		if err != nil {
			continue // Skip creators with errors
		}
		teamMetrics[creator.ID.String()] = metrics
	}

	return teamMetrics, nil
}