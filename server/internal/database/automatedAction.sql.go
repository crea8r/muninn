// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: automatedAction.sql

package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/sqlc-dev/pqtype"
)

const countActionExecutions = `-- name: CountActionExecutions :one
SELECT COUNT(*) FROM automated_action_execution
WHERE action_id = $1
`

func (q *Queries) CountActionExecutions(ctx context.Context, actionID uuid.UUID) (int64, error) {
	row := q.queryRow(ctx, q.countActionExecutionsStmt, countActionExecutions, actionID)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const countAutomatedActions = `-- name: CountAutomatedActions :one
SELECT COUNT(*) FROM automated_action 
WHERE org_id = $1 
  AND deleted_at IS NULL
  AND ($2 = '' OR name ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%')
`

type CountAutomatedActionsParams struct {
	OrgID   uuid.UUID   `json:"org_id"`
	Column2 interface{} `json:"column_2"`
}

func (q *Queries) CountAutomatedActions(ctx context.Context, arg CountAutomatedActionsParams) (int64, error) {
	row := q.queryRow(ctx, q.countAutomatedActionsStmt, countAutomatedActions, arg.OrgID, arg.Column2)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const createActionExecution = `-- name: CreateActionExecution :one
INSERT INTO automated_action_execution (
  action_id, status
) VALUES (
  $1, 'running'
)
RETURNING id, action_id, started_at, completed_at, status, objects_affected, error_message, execution_log
`

func (q *Queries) CreateActionExecution(ctx context.Context, actionID uuid.UUID) (AutomatedActionExecution, error) {
	row := q.queryRow(ctx, q.createActionExecutionStmt, createActionExecution, actionID)
	var i AutomatedActionExecution
	err := row.Scan(
		&i.ID,
		&i.ActionID,
		&i.StartedAt,
		&i.CompletedAt,
		&i.Status,
		&i.ObjectsAffected,
		&i.ErrorMessage,
		&i.ExecutionLog,
	)
	return i, err
}

const createAutomatedAction = `-- name: CreateAutomatedAction :one
INSERT INTO automated_action (
  org_id, name, description, filter_config, 
  action_config, created_by
) VALUES (
  $1, $2, $3, $4, $5, $6
)
RETURNING id, org_id, name, description, filter_config, action_config, is_active, last_run_at, created_at, updated_at, created_by, deleted_at
`

type CreateAutomatedActionParams struct {
	OrgID        uuid.UUID       `json:"org_id"`
	Name         string          `json:"name"`
	Description  string          `json:"description"`
	FilterConfig json.RawMessage `json:"filter_config"`
	ActionConfig json.RawMessage `json:"action_config"`
	CreatedBy    uuid.UUID       `json:"created_by"`
}

func (q *Queries) CreateAutomatedAction(ctx context.Context, arg CreateAutomatedActionParams) (AutomatedAction, error) {
	row := q.queryRow(ctx, q.createAutomatedActionStmt, createAutomatedAction,
		arg.OrgID,
		arg.Name,
		arg.Description,
		arg.FilterConfig,
		arg.ActionConfig,
		arg.CreatedBy,
	)
	var i AutomatedAction
	err := row.Scan(
		&i.ID,
		&i.OrgID,
		&i.Name,
		&i.Description,
		&i.FilterConfig,
		&i.ActionConfig,
		&i.IsActive,
		&i.LastRunAt,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.CreatedBy,
		&i.DeletedAt,
	)
	return i, err
}

const deleteActionOldExecutions = `-- name: DeleteActionOldExecutions :exec
DELETE FROM automated_action_execution
WHERE started_at < $1
`

func (q *Queries) DeleteActionOldExecutions(ctx context.Context, startedAt time.Time) error {
	_, err := q.exec(ctx, q.deleteActionOldExecutionsStmt, deleteActionOldExecutions, startedAt)
	return err
}

const deleteAutomatedAction = `-- name: DeleteAutomatedAction :exec
UPDATE automated_action
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = $1
`

func (q *Queries) DeleteAutomatedAction(ctx context.Context, id uuid.UUID) error {
	_, err := q.exec(ctx, q.deleteAutomatedActionStmt, deleteAutomatedAction, id)
	return err
}

const getAutomatedAction = `-- name: GetAutomatedAction :one
SELECT id, org_id, name, description, filter_config, action_config, is_active, last_run_at, created_at, updated_at, created_by, deleted_at FROM automated_action 
WHERE id = $1 AND deleted_at IS NULL
`

func (q *Queries) GetAutomatedAction(ctx context.Context, id uuid.UUID) (AutomatedAction, error) {
	row := q.queryRow(ctx, q.getAutomatedActionStmt, getAutomatedAction, id)
	var i AutomatedAction
	err := row.Scan(
		&i.ID,
		&i.OrgID,
		&i.Name,
		&i.Description,
		&i.FilterConfig,
		&i.ActionConfig,
		&i.IsActive,
		&i.LastRunAt,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.CreatedBy,
		&i.DeletedAt,
	)
	return i, err
}

const getLatestExecution = `-- name: GetLatestExecution :one
SELECT id, action_id, started_at, completed_at, status, objects_affected, error_message, execution_log FROM automated_action_execution
WHERE action_id = $1
ORDER BY started_at DESC
LIMIT 1
`

func (q *Queries) GetLatestExecution(ctx context.Context, actionID uuid.UUID) (AutomatedActionExecution, error) {
	row := q.queryRow(ctx, q.getLatestExecutionStmt, getLatestExecution, actionID)
	var i AutomatedActionExecution
	err := row.Scan(
		&i.ID,
		&i.ActionID,
		&i.StartedAt,
		&i.CompletedAt,
		&i.Status,
		&i.ObjectsAffected,
		&i.ErrorMessage,
		&i.ExecutionLog,
	)
	return i, err
}

const getPendingActions = `-- name: GetPendingActions :many
SELECT id, org_id, name, description, filter_config, action_config, is_active, last_run_at, created_at, updated_at, created_by, deleted_at FROM automated_action
WHERE is_active = true 
AND deleted_at IS NULL
AND (
  last_run_at IS NULL 
  OR last_run_at < CURRENT_TIMESTAMP - INTERVAL '10 minutes'
)
ORDER BY last_run_at NULLS FIRST
`

func (q *Queries) GetPendingActions(ctx context.Context) ([]AutomatedAction, error) {
	rows, err := q.query(ctx, q.getPendingActionsStmt, getPendingActions)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []AutomatedAction
	for rows.Next() {
		var i AutomatedAction
		if err := rows.Scan(
			&i.ID,
			&i.OrgID,
			&i.Name,
			&i.Description,
			&i.FilterConfig,
			&i.ActionConfig,
			&i.IsActive,
			&i.LastRunAt,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.CreatedBy,
			&i.DeletedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listActionExecutions = `-- name: ListActionExecutions :many
SELECT id, action_id, started_at, completed_at, status, objects_affected, error_message, execution_log FROM automated_action_execution
WHERE action_id = $1
ORDER BY started_at DESC
LIMIT $2 OFFSET $3
`

type ListActionExecutionsParams struct {
	ActionID uuid.UUID `json:"action_id"`
	Limit    int32     `json:"limit"`
	Offset   int32     `json:"offset"`
}

func (q *Queries) ListActionExecutions(ctx context.Context, arg ListActionExecutionsParams) ([]AutomatedActionExecution, error) {
	rows, err := q.query(ctx, q.listActionExecutionsStmt, listActionExecutions, arg.ActionID, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []AutomatedActionExecution
	for rows.Next() {
		var i AutomatedActionExecution
		if err := rows.Scan(
			&i.ID,
			&i.ActionID,
			&i.StartedAt,
			&i.CompletedAt,
			&i.Status,
			&i.ObjectsAffected,
			&i.ErrorMessage,
			&i.ExecutionLog,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listAutomatedActions = `-- name: ListAutomatedActions :many
SELECT id, org_id, name, description, filter_config, action_config, is_active, last_run_at, created_at, updated_at, created_by, deleted_at FROM automated_action 
WHERE org_id = $1 
  AND deleted_at IS NULL 
  AND ($2 = '' OR name ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%')
ORDER BY created_at DESC
LIMIT $3 OFFSET $4
`

type ListAutomatedActionsParams struct {
	OrgID   uuid.UUID   `json:"org_id"`
	Column2 interface{} `json:"column_2"`
	Limit   int32       `json:"limit"`
	Offset  int32       `json:"offset"`
}

func (q *Queries) ListAutomatedActions(ctx context.Context, arg ListAutomatedActionsParams) ([]AutomatedAction, error) {
	rows, err := q.query(ctx, q.listAutomatedActionsStmt, listAutomatedActions,
		arg.OrgID,
		arg.Column2,
		arg.Limit,
		arg.Offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []AutomatedAction
	for rows.Next() {
		var i AutomatedAction
		if err := rows.Scan(
			&i.ID,
			&i.OrgID,
			&i.Name,
			&i.Description,
			&i.FilterConfig,
			&i.ActionConfig,
			&i.IsActive,
			&i.LastRunAt,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.CreatedBy,
			&i.DeletedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateActionExecution = `-- name: UpdateActionExecution :one
UPDATE automated_action_execution
SET status = $2,
  completed_at = CURRENT_TIMESTAMP,
  objects_affected = $3,
  error_message = $4,
  execution_log = $5
WHERE id = $1
RETURNING id, action_id, started_at, completed_at, status, objects_affected, error_message, execution_log
`

type UpdateActionExecutionParams struct {
	ID              uuid.UUID             `json:"id"`
	Status          string                `json:"status"`
	ObjectsAffected int32                 `json:"objects_affected"`
	ErrorMessage    sql.NullString        `json:"error_message"`
	ExecutionLog    pqtype.NullRawMessage `json:"execution_log"`
}

func (q *Queries) UpdateActionExecution(ctx context.Context, arg UpdateActionExecutionParams) (AutomatedActionExecution, error) {
	row := q.queryRow(ctx, q.updateActionExecutionStmt, updateActionExecution,
		arg.ID,
		arg.Status,
		arg.ObjectsAffected,
		arg.ErrorMessage,
		arg.ExecutionLog,
	)
	var i AutomatedActionExecution
	err := row.Scan(
		&i.ID,
		&i.ActionID,
		&i.StartedAt,
		&i.CompletedAt,
		&i.Status,
		&i.ObjectsAffected,
		&i.ErrorMessage,
		&i.ExecutionLog,
	)
	return i, err
}

const updateActionLastRun = `-- name: UpdateActionLastRun :exec
UPDATE automated_action
SET last_run_at = CURRENT_TIMESTAMP
WHERE id = $1
`

func (q *Queries) UpdateActionLastRun(ctx context.Context, id uuid.UUID) error {
	_, err := q.exec(ctx, q.updateActionLastRunStmt, updateActionLastRun, id)
	return err
}

const updateAutomatedAction = `-- name: UpdateAutomatedAction :one
UPDATE automated_action
SET name = $2,
  description = $3,
  filter_config = $4,
  action_config = $5,
  is_active = $6
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, org_id, name, description, filter_config, action_config, is_active, last_run_at, created_at, updated_at, created_by, deleted_at
`

type UpdateAutomatedActionParams struct {
	ID           uuid.UUID       `json:"id"`
	Name         string          `json:"name"`
	Description  string          `json:"description"`
	FilterConfig json.RawMessage `json:"filter_config"`
	ActionConfig json.RawMessage `json:"action_config"`
	IsActive     bool            `json:"is_active"`
}

func (q *Queries) UpdateAutomatedAction(ctx context.Context, arg UpdateAutomatedActionParams) (AutomatedAction, error) {
	row := q.queryRow(ctx, q.updateAutomatedActionStmt, updateAutomatedAction,
		arg.ID,
		arg.Name,
		arg.Description,
		arg.FilterConfig,
		arg.ActionConfig,
		arg.IsActive,
	)
	var i AutomatedAction
	err := row.Scan(
		&i.ID,
		&i.OrgID,
		&i.Name,
		&i.Description,
		&i.FilterConfig,
		&i.ActionConfig,
		&i.IsActive,
		&i.LastRunAt,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.CreatedBy,
		&i.DeletedAt,
	)
	return i, err
}
