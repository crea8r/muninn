package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type AutomationHandler struct {
    db *database.Queries
}

func NewAutomationHandler(db *database.Queries) *AutomationHandler {
    return &AutomationHandler{db: db}
}

// ListAutomatedActionsRequest represents the query parameters for listing actions
type ListAutomatedActionsRequest struct {
    Page     int32  `json:"page"`
    PageSize int32  `json:"pageSize"`
    Search   string `json:"search"`
}

// AutomatedActionResponse includes the action and its latest execution
type AutomatedActionResponse struct {
    ID           uuid.UUID             `json:"id"`
    Name         string                `json:"name"`
    Description  string                `json:"description"`
    FilterConfig json.RawMessage       `json:"filterConfig"`
    ActionConfig json.RawMessage       `json:"actionConfig"`
    IsActive     bool                  `json:"isActive"`
    LastRunAt    *time.Time           `json:"lastRunAt"`
    CreatedAt    time.Time            `json:"createdAt"`
    CreatedBy    uuid.UUID            `json:"createdBy"`
    LastExecution *ExecutionSummary    `json:"lastExecution,omitempty"`
}

type ExecutionSummary struct {
    ID               uuid.UUID  `json:"id"`
    Status           string     `json:"status"`
    StartedAt        time.Time  `json:"startedAt"`
    CompletedAt      *time.Time `json:"completedAt"`
    ObjectsProcessed int32      `json:"objectsProcessed"`
    ObjectsAffected  int32      `json:"objectsAffected"`
    ErrorMessage     *string    `json:"errorMessage,omitempty"`
}

// CreateAction creates a new automated action
func (h *AutomationHandler) CreateAction(w http.ResponseWriter, r *http.Request) {
    claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)

    var input struct {
        Name         string          `json:"name"`
        Description  string          `json:"description"`
        FilterConfig json.RawMessage `json:"filterConfig"`
        ActionConfig json.RawMessage `json:"actionConfig"`
    };
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    action, err := h.db.CreateAutomatedAction(r.Context(), database.CreateAutomatedActionParams{
        OrgID:        uuid.MustParse(claims.OrgID),
        Name:         input.Name,
        Description:  input.Description,
        FilterConfig: input.FilterConfig,
        ActionConfig: input.ActionConfig,
        CreatedBy:    uuid.MustParse(claims.CreatorID),
    })

    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    json.NewEncoder(w).Encode(action)
}

// ListActions returns all automated actions for an organization
func (h *AutomationHandler) ListActions(w http.ResponseWriter, r *http.Request) {
    claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
    orgID := uuid.MustParse(claims.OrgID)

    // Parse query parameters
    page, _ := strconv.Atoi(r.URL.Query().Get("page"))
    if page < 1 {
        page = 1
    }
    pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
    if pageSize < 1 {
        pageSize = 10
    }
    search := r.URL.Query().Get("q")

    // Get actions with their latest execution
    actions, err := h.db.ListAutomatedActions(r.Context(), database.ListAutomatedActionsParams{
        OrgID:    orgID,
        Column2:   search,
        Limit:    int32(pageSize),
        Offset:   int32((page - 1) * pageSize),
    })
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Get total count
    totalCount, err := h.db.CountAutomatedActions(r.Context(), database.CountAutomatedActionsParams{
        OrgID:  orgID,
        Column2: search,
    })
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Format response
    response := struct {
        Actions    []AutomatedActionResponse `json:"data"`
        TotalCount int64                    `json:"totalCount"`
        Page       int                      `json:"page"`
        PageSize   int                      `json:"pageSize"`
    }{
        Actions:    make([]AutomatedActionResponse, len(actions)),
        TotalCount: totalCount,
        Page:      page,
        PageSize:  pageSize,
    }

    // Convert and include latest execution for each action
    for i, action := range actions {
        response.Actions[i] = AutomatedActionResponse{
            ID:           action.ID,
            Name:         action.Name,
            Description:  action.Description,
            FilterConfig: action.FilterConfig,
            ActionConfig: action.ActionConfig,
            IsActive:     action.IsActive,
            LastRunAt:    convertToTimeFromSQLNull(action.LastRunAt),
            CreatedAt:    action.CreatedAt,
            CreatedBy:    action.CreatedBy,
        }

        // Get latest execution if exists
        lastExec, err := h.db.GetLatestExecution(r.Context(), action.ID)
        if err == nil {
            response.Actions[i].LastExecution = &ExecutionSummary{
                ID:               lastExec.ID,
                Status:          lastExec.Status,
                StartedAt:       lastExec.StartedAt,
                CompletedAt:     convertToTimeFromSQLNull(lastExec.CompletedAt),
                ObjectsAffected:  lastExec.ObjectsAffected,
                ErrorMessage:     convertToStringFromNullString(lastExec.ErrorMessage),
            }
        }
    }

    json.NewEncoder(w).Encode(response)
}

// GetExecutionLogs returns the execution history for an action
func (h *AutomationHandler) GetExecutionLogs(w http.ResponseWriter, r *http.Request) {
    actionID := chi.URLParam(r, "actionId")
    claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
    
    // Parse pagination
    page, _ := strconv.Atoi(r.URL.Query().Get("page"))
    if page < 1 {
        page = 1
    }
    pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
    if pageSize < 1 {
        pageSize = 10
    }

    // Verify action belongs to org
    action, err := h.db.GetAutomatedAction(r.Context(), uuid.MustParse(actionID))
    if err != nil {
        http.Error(w, "Action not found", http.StatusNotFound)
        return
    }
    if action.OrgID.String() != claims.OrgID {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // Get executions
    executions, err := h.db.ListActionExecutions(r.Context(), database.ListActionExecutionsParams{
        ActionID: uuid.MustParse(actionID),
        Limit:    int32(pageSize),
        Offset:   int32((page - 1) * pageSize),
    })
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Get total count
    totalCount, err := h.db.CountActionExecutions(r.Context(), uuid.MustParse(actionID))
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    type ExecutionLogResponseData struct {
        ID              uuid.UUID             `json:"id"`
        ActionID        uuid.UUID             `json:"actionId"`
        StartedAt       time.Time             `json:"startedAt"`
        CompletedAt     time.Time          `json:"completedAt"`
        Status          string                `json:"status"`
        ObjectsAffected int32                 `json:"objectsAffected"`
        ErrorMessage    string        `json:"errorMessage"`
        ExecutionLog    json.RawMessage `json:"executionLog"`
    }
    data := make([]ExecutionLogResponseData, len(executions))
    for i, execution := range executions {
        data[i] = ExecutionLogResponseData{
            ID:              execution.ID,
            ActionID:        execution.ActionID,
            StartedAt:       execution.StartedAt,
            Status:         execution.Status,
            ObjectsAffected: execution.ObjectsAffected,
        }
        if execution.CompletedAt.Valid {
            data[i].CompletedAt = execution.CompletedAt.Time
        }
        if execution.ErrorMessage.Valid {
            data[i].ErrorMessage = execution.ErrorMessage.String
        }
        if execution.ExecutionLog.Valid {
            data[i].ExecutionLog = execution.ExecutionLog.RawMessage
        }
    }

    response := struct {
        Executions []ExecutionLogResponseData `json:"data"`
        TotalCount int64                              `json:"totalCount"`
        Page       int                                `json:"page"`
        PageSize   int                                `json:"pageSize"`
    }{
        Executions: data,
        TotalCount: totalCount,
        Page:      page,
        PageSize:  pageSize,
    }

    json.NewEncoder(w).Encode(response)
}

// UpdateAction updates an automated action
func (h *AutomationHandler) UpdateAction(w http.ResponseWriter, r *http.Request) {
    actionID := chi.URLParam(r, "actionId")
    claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)

    var input struct {
        Name         string          `json:"name"`
        Description  string          `json:"description"`
        FilterConfig json.RawMessage `json:"filterConfig"`
        ActionConfig json.RawMessage `json:"actionConfig"`
        IsActive     bool           `json:"isActive"`
    }

    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Verify action belongs to org
    action, err := h.db.GetAutomatedAction(r.Context(), uuid.MustParse(actionID))
    if err != nil {
        http.Error(w, "Action not found", http.StatusNotFound)
        return
    }
    if action.OrgID.String() != claims.OrgID {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // Update action
    updatedAction, err := h.db.UpdateAutomatedAction(r.Context(), database.UpdateAutomatedActionParams{
        ID:           uuid.MustParse(actionID),
        Name:         input.Name,
        Description:  input.Description,
        FilterConfig: input.FilterConfig,
        ActionConfig: input.ActionConfig,
        IsActive:     input.IsActive,
    })
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(updatedAction)
}

// DeleteAction soft deletes an automated action
func (h *AutomationHandler) DeleteAction(w http.ResponseWriter, r *http.Request) {
    actionID := chi.URLParam(r, "actionId")
    claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)

    // Verify action belongs to org
    action, err := h.db.GetAutomatedAction(r.Context(), uuid.MustParse(actionID))
    if err != nil {
        http.Error(w, "Action not found", http.StatusNotFound)
        return
    }
    if action.OrgID.String() != claims.OrgID {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // Delete action
    err = h.db.DeleteAutomatedAction(r.Context(), uuid.MustParse(actionID))
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}

func convertToTimeFromSQLNull (nt sql.NullTime) *time.Time {
		if nt.Valid {
				return &nt.Time
		}
		return nil
}

func convertToStringFromNullString (ns sql.NullString) *string {
		if ns.Valid {
				return &ns.String
		}
		return nil
}