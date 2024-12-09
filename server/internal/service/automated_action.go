package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/crea8r/muninn/server/internal/database"
	"github.com/google/uuid"
	"github.com/sqlc-dev/pqtype"
)

// FilterConfig represents the configuration for filtering objects
type FilterConfig struct {
	Search            string          `json:"search,omitempty"`
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
    TagId uuid.UUID `json:"tagId,omitempty"`
    
    // Funnel actions - can contain multiple funnel steps
    FunnelId uuid.UUID `json:"funnelId,omitempty"`
}

// AutomationService handles the execution of automated actions
type AutomationService struct {
    db *database.Queries
}

// ExecuteAction represents the result of an action execution
type ExecuteAction struct {
    TagId    uuid.UUID
    FunnelId uuid.UUID
    Errors       []error
}

// NewAutomationService creates a new automation service
func NewAutomationService(db *database.Queries) *AutomationService {
    return &AutomationService{
        db: db,
    }
}

func (s *AutomationService) ExecuteAction(
    ctx context.Context,
    action database.AutomatedAction,
    filterConfig FilterConfig,
    actionConfig ActionConfig,
) error {
    var stepIDs []uuid.UUID
    var subStatuses []int32
    if filterConfig.FunnelStepFilter != nil {
        if(len(filterConfig.FunnelStepFilter.StepIDs) > 0) {
            stepIDs = filterConfig.FunnelStepFilter.StepIDs
        }
        if(len(filterConfig.FunnelStepFilter.SubStatuses) > 0) {
            subStatuses = filterConfig.FunnelStepFilter.SubStatuses
        }
    }
    var criteria1, criteria2, criteria3 *json.RawMessage
    if filterConfig.TypeValueCriteria != nil {
        if len(filterConfig.TypeValueCriteria.Criteria1) > 0 {
            data, _ := json.Marshal(filterConfig.TypeValueCriteria.Criteria1)
            criteria1 = convertToKeyValue(string(data))
        }
        if len(filterConfig.TypeValueCriteria.Criteria2) > 0 {
            data, _ := json.Marshal(filterConfig.TypeValueCriteria.Criteria2)
            criteria2 = convertToKeyValue(string(data))
        }
        if len(filterConfig.TypeValueCriteria.Criteria3) > 0 {
            data, _ := json.Marshal(filterConfig.TypeValueCriteria.Criteria3)
            criteria3 = convertToKeyValue(string(data))
        }
    }
    // to keep table small, delete old action executions
    // if now is between 7am and 8am then
    hour := time.Now().Hour()
    if hour == 7 {
        // run DeleteActionOldExecutions before 14 days ago
        before7days := time.Now().AddDate(0, 0, -14)
        s.db.DeleteActionOldExecutions(ctx, before7days)
    }
    ac, err := s.db.CreateActionExecution(ctx, action.ID);
    if(err != nil) {
        fmt.Println("Error creating action execution: ", err)
        return err
    }
    executionID := ac.ID
    var funnelId *uuid.UUID
    var tagId *uuid.UUID
    if actionConfig.FunnelId != uuid.Nil {
        funnelId = &actionConfig.FunnelId
    }
    if actionConfig.TagId != uuid.Nil {
        tagId = &actionConfig.TagId
    }
    var search string = ""
    if filterConfig.Search != "" {
        search = filterConfig.Search
    }
    var tagIDs []uuid.UUID
    var typeIDs []uuid.UUID
    if len(filterConfig.TagIDs) > 0 {
        tagIDs = filterConfig.TagIDs
    }
    if len(filterConfig.TypeIDs) > 0 {
        typeIDs = filterConfig.TypeIDs
    }
    params := database.AddTagAndStepToFilteredObjectsParams{
        OrgID:  action.OrgID,
        Column2: search,
        Column3: stepIDs,
        Column4: tagIDs,
        Column5: typeIDs,
        Column6: criteria1,
        Column7: criteria2,
        Column8: criteria3,
        Column9: subStatuses,
        Column10: tagId,
        FunnelID: funnelId,
        CreatorID: action.CreatedBy,
    }
    rows, err := s.db.AddTagAndStepToFilteredObjects(ctx, params)
    status := "completed"
    var noOfAffectedObjects int32 = 0
    var executionLog pqtype.NullRawMessage
    if err != nil {
        fmt.Println("Error executing action: ", err)
        status = "failed"
        errString := fmt.Sprintf("Error executing action: %v", err)
        logJSON, _ := json.Marshal(map[string]string{"error": errString})
        executionLog = pqtype.NullRawMessage{RawMessage: logJSON, Valid: true}
    }else{
        noOfAffectedObjects = int32(len(rows))
        logJSON, _ := json.Marshal(rows)
        executionLog = pqtype.NullRawMessage{RawMessage: logJSON, Valid: true}
    }
    _, err = s.db.UpdateActionExecution(ctx, database.UpdateActionExecutionParams{
        ID:              executionID,
        Status:          status,
        ObjectsAffected: noOfAffectedObjects,
        ExecutionLog:    executionLog,
    })
    s.db.UpdateActionLastRun(ctx, action.ID)

    return err
}

type CriteriaInputFormat struct {
    Field string `json:"field"`
    Value string `json:"value"`
}

func convertToKeyValue(input string) *json.RawMessage {
	// Define a map for the output format
	output := make(map[string]string)

	// Unmarshal the input JSON
	var inputData CriteriaInputFormat
	err := json.Unmarshal([]byte(input), &inputData)
	if err != nil {
		fmt.Println("Error unmarshalling JSON:", err)
		return nil
	}

	// Convert to the desired output format
	output[inputData.Field] = inputData.Value

	// Marshal the output to JSON
	result, err := json.Marshal(output)
	if err != nil {
		fmt.Println("Error marshalling JSON:", err)
		return nil
	}
    return (*json.RawMessage)(&result)
}
