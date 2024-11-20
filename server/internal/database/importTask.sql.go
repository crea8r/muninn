// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: importTask.sql

package database

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/sqlc-dev/pqtype"
)

const completeImportTask = `-- name: CompleteImportTask :one
UPDATE import_task
SET status = $2, result_summary = $3, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING id, org_id, creator_id, obj_type_id, status, progress, total_rows, processed_rows, error_message, result_summary, file_name, created_at, updated_at
`

type CompleteImportTaskParams struct {
	ID            uuid.UUID             `json:"id"`
	Status        string                `json:"status"`
	ResultSummary pqtype.NullRawMessage `json:"result_summary"`
}

func (q *Queries) CompleteImportTask(ctx context.Context, arg CompleteImportTaskParams) (ImportTask, error) {
	row := q.queryRow(ctx, q.completeImportTaskStmt, completeImportTask, arg.ID, arg.Status, arg.ResultSummary)
	var i ImportTask
	err := row.Scan(
		&i.ID,
		&i.OrgID,
		&i.CreatorID,
		&i.ObjTypeID,
		&i.Status,
		&i.Progress,
		&i.TotalRows,
		&i.ProcessedRows,
		&i.ErrorMessage,
		&i.ResultSummary,
		&i.FileName,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const countImportTasks = `-- name: CountImportTasks :one
SELECT COUNT(*) FROM import_task
WHERE org_id = $1
`

func (q *Queries) CountImportTasks(ctx context.Context, orgID uuid.UUID) (int64, error) {
	row := q.queryRow(ctx, q.countImportTasksStmt, countImportTasks, orgID)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const createImportTask = `-- name: CreateImportTask :one
INSERT INTO import_task (
    org_id, creator_id, obj_type_id, status, total_rows, file_name
) VALUES (
    $1, $2, $3, $4, $5, $6
)
RETURNING id, org_id, creator_id, obj_type_id, status, progress, total_rows, processed_rows, error_message, result_summary, file_name, created_at, updated_at
`

type CreateImportTaskParams struct {
	OrgID     uuid.UUID `json:"org_id"`
	CreatorID uuid.UUID `json:"creator_id"`
	ObjTypeID uuid.UUID `json:"obj_type_id"`
	Status    string    `json:"status"`
	TotalRows int32     `json:"total_rows"`
	FileName  string    `json:"file_name"`
}

func (q *Queries) CreateImportTask(ctx context.Context, arg CreateImportTaskParams) (ImportTask, error) {
	row := q.queryRow(ctx, q.createImportTaskStmt, createImportTask,
		arg.OrgID,
		arg.CreatorID,
		arg.ObjTypeID,
		arg.Status,
		arg.TotalRows,
		arg.FileName,
	)
	var i ImportTask
	err := row.Scan(
		&i.ID,
		&i.OrgID,
		&i.CreatorID,
		&i.ObjTypeID,
		&i.Status,
		&i.Progress,
		&i.TotalRows,
		&i.ProcessedRows,
		&i.ErrorMessage,
		&i.ResultSummary,
		&i.FileName,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getImportTask = `-- name: GetImportTask :one
SELECT id, org_id, creator_id, obj_type_id, status, progress, total_rows, processed_rows, error_message, result_summary, file_name, created_at, updated_at FROM import_task
WHERE id = $1
`

func (q *Queries) GetImportTask(ctx context.Context, id uuid.UUID) (ImportTask, error) {
	row := q.queryRow(ctx, q.getImportTaskStmt, getImportTask, id)
	var i ImportTask
	err := row.Scan(
		&i.ID,
		&i.OrgID,
		&i.CreatorID,
		&i.ObjTypeID,
		&i.Status,
		&i.Progress,
		&i.TotalRows,
		&i.ProcessedRows,
		&i.ErrorMessage,
		&i.ResultSummary,
		&i.FileName,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getImportTaskHistory = `-- name: GetImportTaskHistory :many
SELECT id, org_id, creator_id, obj_type_id, status, progress, total_rows, processed_rows, error_message, result_summary, file_name, created_at, updated_at FROM import_task
WHERE org_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3
`

type GetImportTaskHistoryParams struct {
	OrgID  uuid.UUID `json:"org_id"`
	Limit  int32     `json:"limit"`
	Offset int32     `json:"offset"`
}

func (q *Queries) GetImportTaskHistory(ctx context.Context, arg GetImportTaskHistoryParams) ([]ImportTask, error) {
	rows, err := q.query(ctx, q.getImportTaskHistoryStmt, getImportTaskHistory, arg.OrgID, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ImportTask
	for rows.Next() {
		var i ImportTask
		if err := rows.Scan(
			&i.ID,
			&i.OrgID,
			&i.CreatorID,
			&i.ObjTypeID,
			&i.Status,
			&i.Progress,
			&i.TotalRows,
			&i.ProcessedRows,
			&i.ErrorMessage,
			&i.ResultSummary,
			&i.FileName,
			&i.CreatedAt,
			&i.UpdatedAt,
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

const getObjectByIDString = `-- name: GetObjectByIDString :one
SELECT id, name, photo, description, id_string, creator_id, created_at, deleted_at, aliases FROM obj
WHERE id_string = $1 OR $1 = ANY(aliases)
AND deleted_at IS NULL
ORDER BY (id_string = $1) DESC
LIMIT 1
`

func (q *Queries) GetObjectByIDString(ctx context.Context, idString string) (Obj, error) {
	row := q.queryRow(ctx, q.getObjectByIDStringStmt, getObjectByIDString, idString)
	var i Obj
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Photo,
		&i.Description,
		&i.IDString,
		&i.CreatorID,
		&i.CreatedAt,
		&i.DeletedAt,
		pq.Array(&i.Aliases),
	)
	return i, err
}

const getObjectTypeValue = `-- name: GetObjectTypeValue :one
SELECT id, obj_id, type_id, type_values, created_at, last_updated, deleted_at, search_vector FROM obj_type_value
WHERE obj_id = $1 AND type_id = $2
LIMIT 1
`

type GetObjectTypeValueParams struct {
	ObjID  uuid.UUID `json:"obj_id"`
	TypeID uuid.UUID `json:"type_id"`
}

func (q *Queries) GetObjectTypeValue(ctx context.Context, arg GetObjectTypeValueParams) (ObjTypeValue, error) {
	row := q.queryRow(ctx, q.getObjectTypeValueStmt, getObjectTypeValue, arg.ObjID, arg.TypeID)
	var i ObjTypeValue
	err := row.Scan(
		&i.ID,
		&i.ObjID,
		&i.TypeID,
		&i.TypeValues,
		&i.CreatedAt,
		&i.LastUpdated,
		&i.DeletedAt,
		&i.SearchVector,
	)
	return i, err
}

const getOngoingImportTask = `-- name: GetOngoingImportTask :one
SELECT id, org_id, creator_id, obj_type_id, status, progress, total_rows, processed_rows, error_message, result_summary, file_name, created_at, updated_at FROM import_task
WHERE org_id = $1 AND status IN ('pending', 'processing')
ORDER BY created_at DESC
LIMIT 1
`

func (q *Queries) GetOngoingImportTask(ctx context.Context, orgID uuid.UUID) (ImportTask, error) {
	row := q.queryRow(ctx, q.getOngoingImportTaskStmt, getOngoingImportTask, orgID)
	var i ImportTask
	err := row.Scan(
		&i.ID,
		&i.OrgID,
		&i.CreatorID,
		&i.ObjTypeID,
		&i.Status,
		&i.Progress,
		&i.TotalRows,
		&i.ProcessedRows,
		&i.ErrorMessage,
		&i.ResultSummary,
		&i.FileName,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const updateImportTaskError = `-- name: UpdateImportTaskError :one
UPDATE import_task
SET status = $2, error_message = $3, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING id, org_id, creator_id, obj_type_id, status, progress, total_rows, processed_rows, error_message, result_summary, file_name, created_at, updated_at
`

type UpdateImportTaskErrorParams struct {
	ID           uuid.UUID      `json:"id"`
	Status       string         `json:"status"`
	ErrorMessage sql.NullString `json:"error_message"`
}

func (q *Queries) UpdateImportTaskError(ctx context.Context, arg UpdateImportTaskErrorParams) (ImportTask, error) {
	row := q.queryRow(ctx, q.updateImportTaskErrorStmt, updateImportTaskError, arg.ID, arg.Status, arg.ErrorMessage)
	var i ImportTask
	err := row.Scan(
		&i.ID,
		&i.OrgID,
		&i.CreatorID,
		&i.ObjTypeID,
		&i.Status,
		&i.Progress,
		&i.TotalRows,
		&i.ProcessedRows,
		&i.ErrorMessage,
		&i.ResultSummary,
		&i.FileName,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const updateImportTaskProgress = `-- name: UpdateImportTaskProgress :one
UPDATE import_task
SET progress = $2, processed_rows = $3, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING id, org_id, creator_id, obj_type_id, status, progress, total_rows, processed_rows, error_message, result_summary, file_name, created_at, updated_at
`

type UpdateImportTaskProgressParams struct {
	ID            uuid.UUID     `json:"id"`
	Progress      sql.NullInt32 `json:"progress"`
	ProcessedRows sql.NullInt32 `json:"processed_rows"`
}

func (q *Queries) UpdateImportTaskProgress(ctx context.Context, arg UpdateImportTaskProgressParams) (ImportTask, error) {
	row := q.queryRow(ctx, q.updateImportTaskProgressStmt, updateImportTaskProgress, arg.ID, arg.Progress, arg.ProcessedRows)
	var i ImportTask
	err := row.Scan(
		&i.ID,
		&i.OrgID,
		&i.CreatorID,
		&i.ObjTypeID,
		&i.Status,
		&i.Progress,
		&i.TotalRows,
		&i.ProcessedRows,
		&i.ErrorMessage,
		&i.ResultSummary,
		&i.FileName,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const updateImportTaskStatus = `-- name: UpdateImportTaskStatus :one
UPDATE import_task
SET status = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING id, org_id, creator_id, obj_type_id, status, progress, total_rows, processed_rows, error_message, result_summary, file_name, created_at, updated_at
`

type UpdateImportTaskStatusParams struct {
	ID     uuid.UUID `json:"id"`
	Status string    `json:"status"`
}

func (q *Queries) UpdateImportTaskStatus(ctx context.Context, arg UpdateImportTaskStatusParams) (ImportTask, error) {
	row := q.queryRow(ctx, q.updateImportTaskStatusStmt, updateImportTaskStatus, arg.ID, arg.Status)
	var i ImportTask
	err := row.Scan(
		&i.ID,
		&i.OrgID,
		&i.CreatorID,
		&i.ObjTypeID,
		&i.Status,
		&i.Progress,
		&i.TotalRows,
		&i.ProcessedRows,
		&i.ErrorMessage,
		&i.ResultSummary,
		&i.FileName,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const upsertObjectTypeValue = `-- name: UpsertObjectTypeValue :one
INSERT INTO obj_type_value (
    obj_id,
    type_id,
    type_values
)
VALUES ($1, $2, $3)
ON CONFLICT (obj_id, type_id) 
DO UPDATE SET 
    type_values = EXCLUDED.type_values,
    last_updated = CURRENT_TIMESTAMP
RETURNING id, obj_id, type_id, type_values, created_at, last_updated, deleted_at, search_vector
`

type UpsertObjectTypeValueParams struct {
	ObjID      uuid.UUID       `json:"obj_id"`
	TypeID     uuid.UUID       `json:"type_id"`
	TypeValues json.RawMessage `json:"type_values"`
}

func (q *Queries) UpsertObjectTypeValue(ctx context.Context, arg UpsertObjectTypeValueParams) (ObjTypeValue, error) {
	row := q.queryRow(ctx, q.upsertObjectTypeValueStmt, upsertObjectTypeValue, arg.ObjID, arg.TypeID, arg.TypeValues)
	var i ObjTypeValue
	err := row.Scan(
		&i.ID,
		&i.ObjID,
		&i.TypeID,
		&i.TypeValues,
		&i.CreatedAt,
		&i.LastUpdated,
		&i.DeletedAt,
		&i.SearchVector,
	)
	return i, err
}
