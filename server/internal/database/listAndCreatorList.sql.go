// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: listAndCreatorList.sql

package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

const countListsByOrgID = `-- name: CountListsByOrgID :one
SELECT COUNT(*)
FROM list l
JOIN creator c ON l.creator_id = c.id
WHERE c.org_id = $1 AND l.deleted_at IS NULL
`

func (q *Queries) CountListsByOrgID(ctx context.Context, orgID uuid.UUID) (int64, error) {
	row := q.queryRow(ctx, q.countListsByOrgIDStmt, countListsByOrgID, orgID)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const createCreatorList = `-- name: CreateCreatorList :one
INSERT INTO creator_list (creator_id, list_id, params)
VALUES ($1, $2, '{}')
RETURNING id, creator_id, list_id, params, created_at, last_updated
`

type CreateCreatorListParams struct {
	CreatorID uuid.UUID `json:"creator_id"`
	ListID    uuid.UUID `json:"list_id"`
}

func (q *Queries) CreateCreatorList(ctx context.Context, arg CreateCreatorListParams) (CreatorList, error) {
	row := q.queryRow(ctx, q.createCreatorListStmt, createCreatorList, arg.CreatorID, arg.ListID)
	var i CreatorList
	err := row.Scan(
		&i.ID,
		&i.CreatorID,
		&i.ListID,
		&i.Params,
		&i.CreatedAt,
		&i.LastUpdated,
	)
	return i, err
}

const createList = `-- name: CreateList :one
INSERT INTO list (name, description, filter_setting, creator_id)
VALUES ($1, $2, $3, $4)
RETURNING id, name, description, filter_setting, creator_id, created_at, last_updated, deleted_at
`

type CreateListParams struct {
	Name          string          `json:"name"`
	Description   string          `json:"description"`
	FilterSetting json.RawMessage `json:"filter_setting"`
	CreatorID     uuid.UUID       `json:"creator_id"`
}

func (q *Queries) CreateList(ctx context.Context, arg CreateListParams) (List, error) {
	row := q.queryRow(ctx, q.createListStmt, createList,
		arg.Name,
		arg.Description,
		arg.FilterSetting,
		arg.CreatorID,
	)
	var i List
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.FilterSetting,
		&i.CreatorID,
		&i.CreatedAt,
		&i.LastUpdated,
		&i.DeletedAt,
	)
	return i, err
}

const deleteCreatorList = `-- name: DeleteCreatorList :exec
DELETE FROM creator_list
WHERE id=$1
`

func (q *Queries) DeleteCreatorList(ctx context.Context, id uuid.UUID) error {
	_, err := q.exec(ctx, q.deleteCreatorListStmt, deleteCreatorList, id)
	return err
}

const deleteList = `-- name: DeleteList :exec
DELETE FROM list
WHERE list.id = $1
AND NOT EXISTS (
  SELECT 1
  FROM creator_list
  WHERE creator_list.list_id = $1
)
`

func (q *Queries) DeleteList(ctx context.Context, id uuid.UUID) error {
	_, err := q.exec(ctx, q.deleteListStmt, deleteList, id)
	return err
}

const getCreatorListByID = `-- name: GetCreatorListByID :one
SELECT cl.id, cl.creator_id, cl.list_id, cl.params, cl.created_at, cl.last_updated, l.name as list_name, l.description as list_description, l.filter_setting as list_filter_setting
FROM creator_list cl
JOIN list l ON cl.list_id = l.id
WHERE cl.id = $1 AND l.deleted_at IS NULL
`

type GetCreatorListByIDRow struct {
	ID                uuid.UUID       `json:"id"`
	CreatorID         uuid.UUID       `json:"creator_id"`
	ListID            uuid.UUID       `json:"list_id"`
	Params            json.RawMessage `json:"params"`
	CreatedAt         time.Time       `json:"created_at"`
	LastUpdated       time.Time       `json:"last_updated"`
	ListName          string          `json:"list_name"`
	ListDescription   string          `json:"list_description"`
	ListFilterSetting json.RawMessage `json:"list_filter_setting"`
}

func (q *Queries) GetCreatorListByID(ctx context.Context, id uuid.UUID) (GetCreatorListByIDRow, error) {
	row := q.queryRow(ctx, q.getCreatorListByIDStmt, getCreatorListByID, id)
	var i GetCreatorListByIDRow
	err := row.Scan(
		&i.ID,
		&i.CreatorID,
		&i.ListID,
		&i.Params,
		&i.CreatedAt,
		&i.LastUpdated,
		&i.ListName,
		&i.ListDescription,
		&i.ListFilterSetting,
	)
	return i, err
}

const getListByID = `-- name: GetListByID :one
SELECT l.id
FROM list l
WHERE l.id = $1 AND l.deleted_at IS NULL
`

func (q *Queries) GetListByID(ctx context.Context, id uuid.UUID) (uuid.UUID, error) {
	row := q.queryRow(ctx, q.getListByIDStmt, getListByID, id)
	err := row.Scan(&id)
	return id, err
}

const listCreatorListsByCreatorID = `-- name: ListCreatorListsByCreatorID :many
SELECT cl.id, cl.creator_id, cl.list_id, cl.params, cl.created_at, cl.last_updated, l.name as list_name, l.description as list_description, l.filter_setting as list_filter_setting
FROM creator_list cl
JOIN list l ON cl.list_id = l.id
WHERE cl.creator_id = $1 AND l.deleted_at IS NULL
ORDER BY cl.last_updated DESC
`

type ListCreatorListsByCreatorIDRow struct {
	ID                uuid.UUID       `json:"id"`
	CreatorID         uuid.UUID       `json:"creator_id"`
	ListID            uuid.UUID       `json:"list_id"`
	Params            json.RawMessage `json:"params"`
	CreatedAt         time.Time       `json:"created_at"`
	LastUpdated       time.Time       `json:"last_updated"`
	ListName          string          `json:"list_name"`
	ListDescription   string          `json:"list_description"`
	ListFilterSetting json.RawMessage `json:"list_filter_setting"`
}

func (q *Queries) ListCreatorListsByCreatorID(ctx context.Context, creatorID uuid.UUID) ([]ListCreatorListsByCreatorIDRow, error) {
	rows, err := q.query(ctx, q.listCreatorListsByCreatorIDStmt, listCreatorListsByCreatorID, creatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListCreatorListsByCreatorIDRow
	for rows.Next() {
		var i ListCreatorListsByCreatorIDRow
		if err := rows.Scan(
			&i.ID,
			&i.CreatorID,
			&i.ListID,
			&i.Params,
			&i.CreatedAt,
			&i.LastUpdated,
			&i.ListName,
			&i.ListDescription,
			&i.ListFilterSetting,
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

const listListsByOrgID = `-- name: ListListsByOrgID :many
SELECT l.id, l.name, l.description, l.filter_setting, l.creator_id, l.created_at, l.last_updated, l.deleted_at, c.username as creator_name
FROM list l
JOIN creator c ON l.creator_id = c.id
WHERE c.org_id = $1 AND l.deleted_at IS NULL
ORDER BY l.last_updated DESC
LIMIT $2 OFFSET $3
`

type ListListsByOrgIDParams struct {
	OrgID  uuid.UUID `json:"org_id"`
	Limit  int32     `json:"limit"`
	Offset int32     `json:"offset"`
}

type ListListsByOrgIDRow struct {
	ID            uuid.UUID       `json:"id"`
	Name          string          `json:"name"`
	Description   string          `json:"description"`
	FilterSetting json.RawMessage `json:"filter_setting"`
	CreatorID     uuid.UUID       `json:"creator_id"`
	CreatedAt     time.Time       `json:"created_at"`
	LastUpdated   time.Time       `json:"last_updated"`
	DeletedAt     sql.NullTime    `json:"deleted_at"`
	CreatorName   string          `json:"creator_name"`
}

func (q *Queries) ListListsByOrgID(ctx context.Context, arg ListListsByOrgIDParams) ([]ListListsByOrgIDRow, error) {
	rows, err := q.query(ctx, q.listListsByOrgIDStmt, listListsByOrgID, arg.OrgID, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListListsByOrgIDRow
	for rows.Next() {
		var i ListListsByOrgIDRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.FilterSetting,
			&i.CreatorID,
			&i.CreatedAt,
			&i.LastUpdated,
			&i.DeletedAt,
			&i.CreatorName,
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

const updateCreatorList = `-- name: UpdateCreatorList :one
UPDATE creator_list
SET params = $2, last_updated = CURRENT_TIMESTAMP
WHERE id=$1
RETURNING id, creator_id, list_id, params, created_at, last_updated
`

type UpdateCreatorListParams struct {
	ID     uuid.UUID       `json:"id"`
	Params json.RawMessage `json:"params"`
}

func (q *Queries) UpdateCreatorList(ctx context.Context, arg UpdateCreatorListParams) (CreatorList, error) {
	row := q.queryRow(ctx, q.updateCreatorListStmt, updateCreatorList, arg.ID, arg.Params)
	var i CreatorList
	err := row.Scan(
		&i.ID,
		&i.CreatorID,
		&i.ListID,
		&i.Params,
		&i.CreatedAt,
		&i.LastUpdated,
	)
	return i, err
}

const updateList = `-- name: UpdateList :one
UPDATE list
SET name = $2, description = $3, filter_setting = $4, last_updated = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, name, description, filter_setting, creator_id, created_at, last_updated, deleted_at
`

type UpdateListParams struct {
	ID            uuid.UUID       `json:"id"`
	Name          string          `json:"name"`
	Description   string          `json:"description"`
	FilterSetting json.RawMessage `json:"filter_setting"`
}

func (q *Queries) UpdateList(ctx context.Context, arg UpdateListParams) (List, error) {
	row := q.queryRow(ctx, q.updateListStmt, updateList,
		arg.ID,
		arg.Name,
		arg.Description,
		arg.FilterSetting,
	)
	var i List
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.FilterSetting,
		&i.CreatorID,
		&i.CreatedAt,
		&i.LastUpdated,
		&i.DeletedAt,
	)
	return i, err
}
