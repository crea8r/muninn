package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/google/uuid"
	"github.com/sqlc-dev/pqtype"
)

// FilterConfig represents the configuration for filtering objects
type FilterConfig struct {
	Search            *string          `json:"search,omitempty"`
	TagIDs            []uuid.UUID      `json:"tagIds,omitempty"`
	TypeIDs           []uuid.UUID      `json:"typeIds,omitempty"`
	TypeValueCriteria *TypeValueFilter `json:"typeValueCriteria,omitempty"`
	FunnelStepFilter  *FunnelStepFilter `json:"funnelStepFilter,omitempty"`
}

type FunnelStepFilter struct {
	FunnelID    *uuid.UUID `json:"funnelId"`
	StepIDs     []uuid.UUID `json:"stepIds"`
	SubStatuses []int32       `json:"subStatuses"`
}

type TypeValueFilter struct {
	Criteria1 map[string]string `json:"criteria1,omitempty"`
	Criteria2 map[string]string `json:"criteria2,omitempty"`
	Criteria3 map[string]string `json:"criteria3,omitempty"`
}

// ActionConfig now combines both tag and funnel actions
type ActionConfig struct {
    // Tag actions
    AddTags []uuid.UUID `json:"addTags,omitempty"`
    
    // Funnel actions - can contain multiple funnel steps
    FunnelSteps []FunnelStepAction `json:"funnelSteps,omitempty"`
}

type FunnelStepAction struct {
    FunnelID uuid.UUID `json:"funnelId"`
    StepID   uuid.UUID `json:"stepId"`
}

// AutomationService handles the execution of automated actions
type AutomationService struct {
    db *database.Queries
    objectService *ObjectService
}

// ExecuteAction represents the result of an action execution
type ExecuteAction struct {
    TagsAdded    []uuid.UUID
    FunnelsAdded []FunnelStepAction
    Errors       []error
}

func (s *AutomationService) executeAction(
    ctx context.Context,
    action database.AutomatedAction,
    filterConfig FilterConfig,
    actionConfig ActionConfig,
    executionID uuid.UUID,
) error {
    // Get filtered objects using ObjectService
    objects, err := s.db.ListMatchingObjectIDs(ctx, database.ListMatchingObjectIDsParams{
        OrgID:  action.OrgID,
        Column2: filterConfig.Search,
        Column3: filterConfig.FunnelStepFilter.StepIDs,
        Column4: filterConfig.TagIDs,
        Column5: filterConfig.TypeIDs,
        Column6: marshalJSONB(filterConfig.TypeValueCriteria.Criteria1),
        Column7: marshalJSONB(filterConfig.TypeValueCriteria.Criteria2),
        Column8: marshalJSONB(filterConfig.TypeValueCriteria.Criteria3),
        Column9: filterConfig.FunnelStepFilter.SubStatuses,
    })
    if err != nil {
        return fmt.Errorf("failed to get filtered objects: %w", err)
    }

    processedCount := 0
    affectedCount := 0
    executionLog := make([]map[string]interface{}, 0)

    // Process each object
    for _, obj := range objects {
        processedCount++
        result := ExecuteAction{}

        // Process tags
        if len(actionConfig.AddTags) > 0 {
            addedTags, err := s.processAddTags(ctx, obj, actionConfig.AddTags)
            if err != nil {
                result.Errors = append(result.Errors, fmt.Errorf("tag error: %w", err))
            }
            result.TagsAdded = addedTags
        }

        // Process funnel steps
        if len(actionConfig.FunnelSteps) > 0 {
            addedFunnels, err := s.processAddToFunnels(ctx, obj, actionConfig.FunnelSteps)
            if err != nil {
                result.Errors = append(result.Errors, fmt.Errorf("funnel error: %w", err))
            }
            result.FunnelsAdded = addedFunnels
        }

        // Log the results
        logEntry := map[string]interface{}{
            "object_id": obj.ID,
            "success":   len(result.Errors) == 0,
        }

        if len(result.TagsAdded) > 0 {
            logEntry["tags_added"] = result.TagsAdded
        }
        if len(result.FunnelsAdded) > 0 {
            logEntry["funnels_added"] = result.FunnelsAdded
        }
        if len(result.Errors) > 0 {
            logEntry["errors"] = result.Errors
        }

        executionLog = append(executionLog, logEntry)

        // Count as affected if any action was successful
        if len(result.TagsAdded) > 0 || len(result.FunnelsAdded) > 0 {
            affectedCount++
        }
    }

    // Update execution record
    logJSON, _ := json.Marshal(executionLog)
    _, err = s.db.UpdateActionExecution(ctx, database.UpdateActionExecutionParams{
        ID:              executionID,
        Status:          "completed",
        ObjectsProcessed: int32(processedCount),
        ObjectsAffected:  int32(affectedCount),
        ExecutionLog:    pqtype.NullRawMessage{RawMessage: logJSON, Valid: true},
    })

    return err
}

func (s *AutomationService) processAddTags(ctx context.Context, obj database.ListMatchingObjectIDsRow, tagIDs []uuid.UUID) ([]uuid.UUID, error) {
    addedTags := make([]uuid.UUID, 0)
    // convert interface{} to []uuid.UUID
    existingtagIDs := make([]uuid.UUID, 0)
    if obj.TagIds != nil {
        existingtagIDs = obj.TagIds.([]uuid.UUID)
    }
    for _, tagID := range tagIDs {
        if contains(existingtagIDs, tagID) {
            continue
        }

        // Add tag
        err := s.db.AddTagToObject(ctx, database.AddTagToObjectParams{
            ObjID: obj.ID,
            TagID: tagID,
        })
        if err != nil {
            return addedTags, err
        }

        addedTags = append(addedTags, tagID)
    }

    return addedTags, nil
}

func (s *AutomationService) processAddToFunnels(ctx context.Context, obj database.ListMatchingObjectIDsRow, funnelSteps []FunnelStepAction) ([]FunnelStepAction, error) {
    addedFunnels := make([]FunnelStepAction, 0)
    existingFunnelIds := make([]uuid.UUID, 0)
    if obj.FunnelIds != nil {
        existingFunnelIds = obj.FunnelIds.([]uuid.UUID)
    }
    // get the creatorId from context
    claims := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
    
    
    for _, funnelStep := range funnelSteps {
        // Check if object is already in this funnel
        if contains(existingFunnelIds, funnelStep.FunnelID) {
            continue
        }

        s.db.AddObjectToFirstStep(ctx, database.AddObjectToFirstStepParams{
            ObjID:    obj.ID,
            FunnelID: funnelStep.FunnelID,
            CreatorID: uuid.MustParse(claims.CreatorID),
        })

        addedFunnels = append(addedFunnels, funnelStep)
    }

    return addedFunnels, nil
}

func contains(ids []uuid.UUID, id uuid.UUID) bool {
    for _, tmp := range ids {
        if tmp == id {
            return true
        }
    }
    return false
}

func marshalJSONB(v interface{}) []byte {
    if v == nil {
        return nil
    }
    b, _ := json.Marshal(v)
    return b
}