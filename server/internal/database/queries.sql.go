// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: queries.sql

package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

const countFunnels = `-- name: CountFunnels :one
SELECT COUNT(*)
FROM funnel f
JOIN creator c ON c.id = f.creator_id
WHERE c.org_id = $1 AND f.deleted_at IS NULL
  AND ($2::text = '' OR (
    f.name ILIKE '%' || $2 || '%' OR
    f.description ILIKE '%' || $2 || '%' OR
    EXISTS (
      SELECT 1 FROM step s
      WHERE s.funnel_id = f.id AND (
        s.name ILIKE '%' || $2 || '%' OR
        s.definition ILIKE '%' || $2 || '%' OR
        s.example ILIKE '%' || $2 || '%' OR
        s.action ILIKE '%' || $2 || '%'
      )
    )
  ))
`

type CountFunnelsParams struct {
	OrgID   uuid.UUID `json:"org_id"`
	Column2 string    `json:"column_2"`
}

func (q *Queries) CountFunnels(ctx context.Context, arg CountFunnelsParams) (int64, error) {
	row := q.queryRow(ctx, q.countFunnelsStmt, countFunnels, arg.OrgID, arg.Column2)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const countObjectTypes = `-- name: CountObjectTypes :one
SELECT COUNT(*) 
FROM obj_type o
JOIN creator c ON o.creator_id = c.id
WHERE c.org_id = $1
  AND o.deleted_at IS NULL
  AND ($2::text = '' OR 
       o.name ILIKE '%' || $2 || '%' OR 
       o.description ILIKE '%' || $2 || '%' OR
       o.fields_search @@ to_tsquery('english', $2))
`

type CountObjectTypesParams struct {
	OrgID   uuid.UUID `json:"org_id"`
	Column2 string    `json:"column_2"`
}

func (q *Queries) CountObjectTypes(ctx context.Context, arg CountObjectTypesParams) (int64, error) {
	row := q.queryRow(ctx, q.countObjectTypesStmt, countObjectTypes, arg.OrgID, arg.Column2)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const countObjectsByOrgID = `-- name: CountObjectsByOrgID :one
SELECT COUNT(DISTINCT o.id)
FROM obj o
JOIN creator c ON o.creator_id = c.id
LEFT JOIN obj_tag ot ON o.id = ot.obj_id
LEFT JOIN tag t ON ot.tag_id = t.id
LEFT JOIN obj_type_value otv ON o.id = otv.obj_id
LEFT JOIN obj_fact of ON o.id = of.obj_id
LEFT JOIN fact f ON of.fact_id = f.id
WHERE c.org_id = $1 AND o.deleted_at IS NULL
  AND ($2 = '' OR
       to_tsvector('english', o.name || ' ' || o.description || ' ' || o.id_string) @@ to_tsquery('english', $2) OR
       to_tsvector('english', f.text) @@ to_tsquery('english', $2) OR
       otv.search_vector @@ to_tsquery('english', $2))
`

type CountObjectsByOrgIDParams struct {
	OrgID   uuid.UUID   `json:"org_id"`
	Column2 interface{} `json:"column_2"`
}

func (q *Queries) CountObjectsByOrgID(ctx context.Context, arg CountObjectsByOrgIDParams) (int64, error) {
	row := q.queryRow(ctx, q.countObjectsByOrgIDStmt, countObjectsByOrgID, arg.OrgID, arg.Column2)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const countTags = `-- name: CountTags :one
SELECT COUNT(*) 
FROM tag
WHERE org_id = $1
  AND deleted_at IS NULL
  AND ($2::text = '' OR (name ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%'))
`

type CountTagsParams struct {
	OrgID   uuid.UUID `json:"org_id"`
	Column2 string    `json:"column_2"`
}

func (q *Queries) CountTags(ctx context.Context, arg CountTagsParams) (int64, error) {
	row := q.queryRow(ctx, q.countTagsStmt, countTags, arg.OrgID, arg.Column2)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const createCreator = `-- name: CreateCreator :one
INSERT INTO creator (username, pwd, profile, role, org_id, active, created_at)
VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
RETURNING id, username, pwd, profile, role, org_id, active, created_at, deleted_at
`

type CreateCreatorParams struct {
	Username string          `json:"username"`
	Pwd      string          `json:"pwd"`
	Profile  json.RawMessage `json:"profile"`
	Role     string          `json:"role"`
	OrgID    uuid.UUID       `json:"org_id"`
	Active   bool            `json:"active"`
}

func (q *Queries) CreateCreator(ctx context.Context, arg CreateCreatorParams) (Creator, error) {
	row := q.queryRow(ctx, q.createCreatorStmt, createCreator,
		arg.Username,
		arg.Pwd,
		arg.Profile,
		arg.Role,
		arg.OrgID,
		arg.Active,
	)
	var i Creator
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.Pwd,
		&i.Profile,
		&i.Role,
		&i.OrgID,
		&i.Active,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const createFeed = `-- name: CreateFeed :one
INSERT INTO feed (creator_id, content, seen)
VALUES ($1, $2, $3)
RETURNING id, creator_id, content, seen, created_at, deleted_at
`

type CreateFeedParams struct {
	CreatorID uuid.UUID       `json:"creator_id"`
	Content   json.RawMessage `json:"content"`
	Seen      bool            `json:"seen"`
}

func (q *Queries) CreateFeed(ctx context.Context, arg CreateFeedParams) (Feed, error) {
	row := q.queryRow(ctx, q.createFeedStmt, createFeed, arg.CreatorID, arg.Content, arg.Seen)
	var i Feed
	err := row.Scan(
		&i.ID,
		&i.CreatorID,
		&i.Content,
		&i.Seen,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const createFunnel = `-- name: CreateFunnel :one
INSERT INTO funnel (id, name, description, creator_id)
VALUES ($1, $2, $3, $4)
RETURNING id, name, description, creator_id, created_at, deleted_at
`

type CreateFunnelParams struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatorID   uuid.UUID `json:"creator_id"`
}

func (q *Queries) CreateFunnel(ctx context.Context, arg CreateFunnelParams) (Funnel, error) {
	row := q.queryRow(ctx, q.createFunnelStmt, createFunnel,
		arg.ID,
		arg.Name,
		arg.Description,
		arg.CreatorID,
	)
	var i Funnel
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.CreatorID,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const createObject = `-- name: CreateObject :one
INSERT INTO obj (name, description, id_string, creator_id)
VALUES ($1, $2, $3, $4)
RETURNING id, name, description, id_string, creator_id, created_at, deleted_at
`

type CreateObjectParams struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IDString    string    `json:"id_string"`
	CreatorID   uuid.UUID `json:"creator_id"`
}

func (q *Queries) CreateObject(ctx context.Context, arg CreateObjectParams) (Obj, error) {
	row := q.queryRow(ctx, q.createObjectStmt, createObject,
		arg.Name,
		arg.Description,
		arg.IDString,
		arg.CreatorID,
	)
	var i Obj
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.IDString,
		&i.CreatorID,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const createObjectType = `-- name: CreateObjectType :one
INSERT INTO obj_type (name, description, fields, creator_id)
VALUES ($1, $2, $3, $4)
RETURNING id, name, description, fields, creator_id, created_at, deleted_at, fields_search
`

type CreateObjectTypeParams struct {
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Fields      json.RawMessage `json:"fields"`
	CreatorID   uuid.UUID       `json:"creator_id"`
}

func (q *Queries) CreateObjectType(ctx context.Context, arg CreateObjectTypeParams) (ObjType, error) {
	row := q.queryRow(ctx, q.createObjectTypeStmt, createObjectType,
		arg.Name,
		arg.Description,
		arg.Fields,
		arg.CreatorID,
	)
	var i ObjType
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.Fields,
		&i.CreatorID,
		&i.CreatedAt,
		&i.DeletedAt,
		&i.FieldsSearch,
	)
	return i, err
}

const createOrganization = `-- name: CreateOrganization :one
INSERT INTO org (name, profile, created_at)
VALUES ($1, $2, CURRENT_TIMESTAMP)
RETURNING id, name, profile, created_at, deleted_at
`

type CreateOrganizationParams struct {
	Name    string          `json:"name"`
	Profile json.RawMessage `json:"profile"`
}

func (q *Queries) CreateOrganization(ctx context.Context, arg CreateOrganizationParams) (Org, error) {
	row := q.queryRow(ctx, q.createOrganizationStmt, createOrganization, arg.Name, arg.Profile)
	var i Org
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Profile,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const createStep = `-- name: CreateStep :one
INSERT INTO step (id, funnel_id, name, definition, example, action, step_order)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, funnel_id, name, definition, example, action, step_order, created_at, last_updated, deleted_at
`

type CreateStepParams struct {
	ID         uuid.UUID `json:"id"`
	FunnelID   uuid.UUID `json:"funnel_id"`
	Name       string    `json:"name"`
	Definition string    `json:"definition"`
	Example    string    `json:"example"`
	Action     string    `json:"action"`
	StepOrder  int32     `json:"step_order"`
}

func (q *Queries) CreateStep(ctx context.Context, arg CreateStepParams) (Step, error) {
	row := q.queryRow(ctx, q.createStepStmt, createStep,
		arg.ID,
		arg.FunnelID,
		arg.Name,
		arg.Definition,
		arg.Example,
		arg.Action,
		arg.StepOrder,
	)
	var i Step
	err := row.Scan(
		&i.ID,
		&i.FunnelID,
		&i.Name,
		&i.Definition,
		&i.Example,
		&i.Action,
		&i.StepOrder,
		&i.CreatedAt,
		&i.LastUpdated,
		&i.DeletedAt,
	)
	return i, err
}

const createTag = `-- name: CreateTag :one

INSERT INTO tag (name, description, color_schema, org_id)
VALUES ($1, $2, $3, $4)
RETURNING id, name, description, color_schema, org_id, created_at, deleted_at
`

type CreateTagParams struct {
	Name        string          `json:"name"`
	Description string          `json:"description"`
	ColorSchema json.RawMessage `json:"color_schema"`
	OrgID       uuid.UUID       `json:"org_id"`
}

// Setting/Tag section
func (q *Queries) CreateTag(ctx context.Context, arg CreateTagParams) (Tag, error) {
	row := q.queryRow(ctx, q.createTagStmt, createTag,
		arg.Name,
		arg.Description,
		arg.ColorSchema,
		arg.OrgID,
	)
	var i Tag
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.ColorSchema,
		&i.OrgID,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const deleteCreator = `-- name: DeleteCreator :exec
UPDATE creator SET deleted_at = NOW() WHERE id = $1
`

func (q *Queries) DeleteCreator(ctx context.Context, id uuid.UUID) error {
	_, err := q.exec(ctx, q.deleteCreatorStmt, deleteCreator, id)
	return err
}

const deleteFunnel = `-- name: DeleteFunnel :exec
UPDATE funnel
SET deleted_at = CURRENT_TIMESTAMP
WHERE funnel.id = $1 AND deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM obj_step os
    JOIN step s ON s.id = os.step_id
    WHERE s.funnel_id = $1
  )
`

func (q *Queries) DeleteFunnel(ctx context.Context, id uuid.UUID) error {
	_, err := q.exec(ctx, q.deleteFunnelStmt, deleteFunnel, id)
	return err
}

const deleteObject = `-- name: DeleteObject :exec
UPDATE obj SET deleted_at = NOW() WHERE id = $1
`

func (q *Queries) DeleteObject(ctx context.Context, id uuid.UUID) error {
	_, err := q.exec(ctx, q.deleteObjectStmt, deleteObject, id)
	return err
}

const deleteObjectType = `-- name: DeleteObjectType :execrows
UPDATE obj_type
SET deleted_at = CURRENT_TIMESTAMP
WHERE obj_type.id = $1 AND deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM obj_type_value WHERE type_id = $1
  )
`

func (q *Queries) DeleteObjectType(ctx context.Context, id uuid.UUID) (int64, error) {
	result, err := q.exec(ctx, q.deleteObjectTypeStmt, deleteObjectType, id)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

const deleteStep = `-- name: DeleteStep :exec
UPDATE step
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM obj_step os WHERE os.step_id = $1
  )
`

func (q *Queries) DeleteStep(ctx context.Context, id uuid.UUID) error {
	_, err := q.exec(ctx, q.deleteStepStmt, deleteStep, id)
	return err
}

const deleteTag = `-- name: DeleteTag :execrows
DELETE FROM tag 
WHERE id = $1 AND deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM obj_tag WHERE tag_id = $1
  )
`

func (q *Queries) DeleteTag(ctx context.Context, id uuid.UUID) (int64, error) {
	result, err := q.exec(ctx, q.deleteTagStmt, deleteTag, id)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

const getCreator = `-- name: GetCreator :one
SELECT id, username, pwd, profile, role, org_id, active, created_at, deleted_at FROM creator WHERE id = $1 LIMIT 1
`

func (q *Queries) GetCreator(ctx context.Context, id uuid.UUID) (Creator, error) {
	row := q.queryRow(ctx, q.getCreatorStmt, getCreator, id)
	var i Creator
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.Pwd,
		&i.Profile,
		&i.Role,
		&i.OrgID,
		&i.Active,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const getCreatorByID = `-- name: GetCreatorByID :one
SELECT id, username, pwd, profile, role, org_id, active, created_at, deleted_at FROM creator WHERE id = $1 LIMIT 1
`

func (q *Queries) GetCreatorByID(ctx context.Context, id uuid.UUID) (Creator, error) {
	row := q.queryRow(ctx, q.getCreatorByIDStmt, getCreatorByID, id)
	var i Creator
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.Pwd,
		&i.Profile,
		&i.Role,
		&i.OrgID,
		&i.Active,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const getCreatorByUsername = `-- name: GetCreatorByUsername :one
SELECT id, username, pwd, profile, role, org_id, active, created_at, deleted_at FROM creator
WHERE username = $1 AND active = $2
`

type GetCreatorByUsernameParams struct {
	Username string `json:"username"`
	Active   bool   `json:"active"`
}

func (q *Queries) GetCreatorByUsername(ctx context.Context, arg GetCreatorByUsernameParams) (Creator, error) {
	row := q.queryRow(ctx, q.getCreatorByUsernameStmt, getCreatorByUsername, arg.Username, arg.Active)
	var i Creator
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.Pwd,
		&i.Profile,
		&i.Role,
		&i.OrgID,
		&i.Active,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const getFeed = `-- name: GetFeed :many
SELECT id, creator_id, content, seen, created_at, deleted_at FROM feed
WHERE creator_id = $1 AND seen = false
ORDER BY created_at DESC
`

func (q *Queries) GetFeed(ctx context.Context, creatorID uuid.UUID) ([]Feed, error) {
	rows, err := q.query(ctx, q.getFeedStmt, getFeed, creatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Feed
	for rows.Next() {
		var i Feed
		if err := rows.Scan(
			&i.ID,
			&i.CreatorID,
			&i.Content,
			&i.Seen,
			&i.CreatedAt,
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

const getFunnel = `-- name: GetFunnel :one
SELECT f.id, f.name, f.description, f.creator_id, f.created_at, f.deleted_at, c.org_id,
       (SELECT COUNT(*) FROM obj_step os
        JOIN step s ON s.id = os.step_id
        WHERE s.funnel_id = f.id) AS object_count
FROM funnel f
JOIN creator c ON c.id = f.creator_id
WHERE f.id = $1 AND f.deleted_at IS NULL
`

type GetFunnelRow struct {
	ID          uuid.UUID    `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	CreatorID   uuid.UUID    `json:"creator_id"`
	CreatedAt   time.Time    `json:"created_at"`
	DeletedAt   sql.NullTime `json:"deleted_at"`
	OrgID       uuid.UUID    `json:"org_id"`
	ObjectCount int64        `json:"object_count"`
}

func (q *Queries) GetFunnel(ctx context.Context, id uuid.UUID) (GetFunnelRow, error) {
	row := q.queryRow(ctx, q.getFunnelStmt, getFunnel, id)
	var i GetFunnelRow
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.CreatorID,
		&i.CreatedAt,
		&i.DeletedAt,
		&i.OrgID,
		&i.ObjectCount,
	)
	return i, err
}

const getObjectTypeByID = `-- name: GetObjectTypeByID :one
SELECT id, name, description, fields, creator_id, created_at, deleted_at, fields_search FROM obj_type
WHERE id = $1 AND deleted_at IS NULL
LIMIT 1
`

func (q *Queries) GetObjectTypeByID(ctx context.Context, id uuid.UUID) (ObjType, error) {
	row := q.queryRow(ctx, q.getObjectTypeByIDStmt, getObjectTypeByID, id)
	var i ObjType
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.Fields,
		&i.CreatorID,
		&i.CreatedAt,
		&i.DeletedAt,
		&i.FieldsSearch,
	)
	return i, err
}

const getSessionByToken = `-- name: GetSessionByToken :one
SELECT id, creator_id, jwt, expired_at, created_at FROM creator_session WHERE jwt = $1 LIMIT 1
`

func (q *Queries) GetSessionByToken(ctx context.Context, jwt string) (CreatorSession, error) {
	row := q.queryRow(ctx, q.getSessionByTokenStmt, getSessionByToken, jwt)
	var i CreatorSession
	err := row.Scan(
		&i.ID,
		&i.CreatorID,
		&i.Jwt,
		&i.ExpiredAt,
		&i.CreatedAt,
	)
	return i, err
}

const getStep = `-- name: GetStep :one
SELECT s.id, s.funnel_id, s.name, s.definition, s.example, s.action, s.step_order, s.created_at, s.last_updated, s.deleted_at, 
       (SELECT COUNT(*) FROM obj_step os WHERE os.step_id = s.id) AS object_count
FROM step s
WHERE s.id = $1 AND s.deleted_at IS NULL
`

type GetStepRow struct {
	ID          uuid.UUID    `json:"id"`
	FunnelID    uuid.UUID    `json:"funnel_id"`
	Name        string       `json:"name"`
	Definition  string       `json:"definition"`
	Example     string       `json:"example"`
	Action      string       `json:"action"`
	StepOrder   int32        `json:"step_order"`
	CreatedAt   time.Time    `json:"created_at"`
	LastUpdated time.Time    `json:"last_updated"`
	DeletedAt   sql.NullTime `json:"deleted_at"`
	ObjectCount int64        `json:"object_count"`
}

func (q *Queries) GetStep(ctx context.Context, id uuid.UUID) (GetStepRow, error) {
	row := q.queryRow(ctx, q.getStepStmt, getStep, id)
	var i GetStepRow
	err := row.Scan(
		&i.ID,
		&i.FunnelID,
		&i.Name,
		&i.Definition,
		&i.Example,
		&i.Action,
		&i.StepOrder,
		&i.CreatedAt,
		&i.LastUpdated,
		&i.DeletedAt,
		&i.ObjectCount,
	)
	return i, err
}

const getTagByID = `-- name: GetTagByID :one
SELECT id, name, description, color_schema, org_id, created_at, deleted_at FROM tag
WHERE id = $1 AND deleted_at IS NULL
LIMIT 1
`

func (q *Queries) GetTagByID(ctx context.Context, id uuid.UUID) (Tag, error) {
	row := q.queryRow(ctx, q.getTagByIDStmt, getTagByID, id)
	var i Tag
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.ColorSchema,
		&i.OrgID,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const listCreators = `-- name: ListCreators :many
SELECT id, username, pwd, profile, role, org_id, active, created_at, deleted_at FROM creator
WHERE org_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3
`

type ListCreatorsParams struct {
	OrgID  uuid.UUID `json:"org_id"`
	Limit  int32     `json:"limit"`
	Offset int32     `json:"offset"`
}

func (q *Queries) ListCreators(ctx context.Context, arg ListCreatorsParams) ([]Creator, error) {
	rows, err := q.query(ctx, q.listCreatorsStmt, listCreators, arg.OrgID, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Creator
	for rows.Next() {
		var i Creator
		if err := rows.Scan(
			&i.ID,
			&i.Username,
			&i.Pwd,
			&i.Profile,
			&i.Role,
			&i.OrgID,
			&i.Active,
			&i.CreatedAt,
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

const listFunnels = `-- name: ListFunnels :many
SELECT f.id, f.name, f.description, f.creator_id, f.created_at, f.deleted_at, c.org_id,
       (SELECT COUNT(*) FROM obj_step os
        JOIN step s ON s.id = os.step_id
        WHERE s.funnel_id = f.id) AS object_count
FROM funnel f
JOIN creator c ON c.id = f.creator_id
WHERE c.org_id = $1 AND f.deleted_at IS NULL
  AND ($2::text = '' OR (
    f.name ILIKE '%' || $2 || '%' OR
    f.description ILIKE '%' || $2 || '%' OR
    EXISTS (
      SELECT 1 FROM step s
      WHERE s.funnel_id = f.id AND (
        s.name ILIKE '%' || $2 || '%' OR
        s.definition ILIKE '%' || $2 || '%' OR
        s.example ILIKE '%' || $2 || '%' OR
        s.action ILIKE '%' || $2 || '%'
      )
    )
  ))
ORDER BY f.created_at DESC
LIMIT $3 OFFSET $4
`

type ListFunnelsParams struct {
	OrgID   uuid.UUID `json:"org_id"`
	Column2 string    `json:"column_2"`
	Limit   int32     `json:"limit"`
	Offset  int32     `json:"offset"`
}

type ListFunnelsRow struct {
	ID          uuid.UUID    `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	CreatorID   uuid.UUID    `json:"creator_id"`
	CreatedAt   time.Time    `json:"created_at"`
	DeletedAt   sql.NullTime `json:"deleted_at"`
	OrgID       uuid.UUID    `json:"org_id"`
	ObjectCount int64        `json:"object_count"`
}

func (q *Queries) ListFunnels(ctx context.Context, arg ListFunnelsParams) ([]ListFunnelsRow, error) {
	rows, err := q.query(ctx, q.listFunnelsStmt, listFunnels,
		arg.OrgID,
		arg.Column2,
		arg.Limit,
		arg.Offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListFunnelsRow
	for rows.Next() {
		var i ListFunnelsRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.CreatorID,
			&i.CreatedAt,
			&i.DeletedAt,
			&i.OrgID,
			&i.ObjectCount,
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

const listObjectTypes = `-- name: ListObjectTypes :many
SELECT o.id, o.name, o.description, o.fields, o.created_at
FROM obj_type o
JOIN creator c ON o.creator_id = c.id
WHERE c.org_id = $1
  AND o.deleted_at IS NULL
  AND ($2::text = '' OR 
       o.name ILIKE '%' || $2 || '%' OR 
       o.description ILIKE '%' || $2 || '%' OR
       o.fields_search @@ to_tsquery('english', $2))
ORDER BY o.created_at DESC
LIMIT $3 OFFSET $4
`

type ListObjectTypesParams struct {
	OrgID   uuid.UUID `json:"org_id"`
	Column2 string    `json:"column_2"`
	Limit   int32     `json:"limit"`
	Offset  int32     `json:"offset"`
}

type ListObjectTypesRow struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Fields      json.RawMessage `json:"fields"`
	CreatedAt   time.Time       `json:"created_at"`
}

func (q *Queries) ListObjectTypes(ctx context.Context, arg ListObjectTypesParams) ([]ListObjectTypesRow, error) {
	rows, err := q.query(ctx, q.listObjectTypesStmt, listObjectTypes,
		arg.OrgID,
		arg.Column2,
		arg.Limit,
		arg.Offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListObjectTypesRow
	for rows.Next() {
		var i ListObjectTypesRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.Fields,
			&i.CreatedAt,
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

const listObjectsByOrgID = `-- name: ListObjectsByOrgID :many
WITH object_data AS (
    SELECT o.id, o.name, o.description, o.id_string, o.creator_id,
           o.created_at, o.deleted_at,
           array_agg(DISTINCT t.id) AS tag_ids,
           string_agg(DISTINCT otv.search_vector::text, ' ')::tsvector AS type_values,
           string_agg(DISTINCT f.text, ' ')::tsvector AS fact_search
    FROM obj o
    JOIN creator c ON o.creator_id = c.id
    LEFT JOIN obj_tag ot ON o.id = ot.obj_id
    LEFT JOIN tag t ON ot.tag_id = t.id
    LEFT JOIN obj_type_value otv ON o.id = otv.obj_id
    LEFT JOIN obj_fact of ON o.id = of.obj_id
    LEFT JOIN fact f ON of.fact_id = f.id
    WHERE c.org_id = $1 AND o.deleted_at IS NULL
    GROUP BY o.id
)
SELECT od.id, od.name, od.description, od.id_string, od.created_at,
       (SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'color_schema', t.color_schema))
        FROM tag t
        WHERE t.id = ANY(od.tag_ids)) AS tags,
       od.type_values
FROM object_data od
WHERE ($2 = '' OR
      od.name ILIKE '%' || $2 || '%' OR 
      od.description ILIKE '%' || $2 || '%' OR 
      od.id_string ILIKE '%' || $2 || '%' OR 
      od.fact_search @@ to_tsquery('english', $2) OR
      od.type_values @@ to_tsquery('english', $2))
ORDER BY od.created_at DESC
LIMIT $3 OFFSET $4
`

type ListObjectsByOrgIDParams struct {
	OrgID   uuid.UUID   `json:"org_id"`
	Column2 interface{} `json:"column_2"`
	Limit   int32       `json:"limit"`
	Offset  int32       `json:"offset"`
}

type ListObjectsByOrgIDRow struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	IDString    string          `json:"id_string"`
	CreatedAt   time.Time       `json:"created_at"`
	Tags        json.RawMessage `json:"tags"`
	TypeValues  interface{}     `json:"type_values"`
}

func (q *Queries) ListObjectsByOrgID(ctx context.Context, arg ListObjectsByOrgIDParams) ([]ListObjectsByOrgIDRow, error) {
	rows, err := q.query(ctx, q.listObjectsByOrgIDStmt, listObjectsByOrgID,
		arg.OrgID,
		arg.Column2,
		arg.Limit,
		arg.Offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListObjectsByOrgIDRow
	for rows.Next() {
		var i ListObjectsByOrgIDRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.IDString,
			&i.CreatedAt,
			&i.Tags,
			&i.TypeValues,
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

const listStepsByFunnel = `-- name: ListStepsByFunnel :many
SELECT s.id, s.funnel_id, s.name, s.definition, s.example, s.action, s.step_order, s.created_at, s.last_updated, s.deleted_at, 
       (SELECT COUNT(*) FROM obj_step os WHERE os.step_id = s.id) AS object_count
FROM step s
WHERE s.funnel_id = $1 AND s.deleted_at IS NULL
ORDER BY s.step_order
`

type ListStepsByFunnelRow struct {
	ID          uuid.UUID    `json:"id"`
	FunnelID    uuid.UUID    `json:"funnel_id"`
	Name        string       `json:"name"`
	Definition  string       `json:"definition"`
	Example     string       `json:"example"`
	Action      string       `json:"action"`
	StepOrder   int32        `json:"step_order"`
	CreatedAt   time.Time    `json:"created_at"`
	LastUpdated time.Time    `json:"last_updated"`
	DeletedAt   sql.NullTime `json:"deleted_at"`
	ObjectCount int64        `json:"object_count"`
}

func (q *Queries) ListStepsByFunnel(ctx context.Context, funnelID uuid.UUID) ([]ListStepsByFunnelRow, error) {
	rows, err := q.query(ctx, q.listStepsByFunnelStmt, listStepsByFunnel, funnelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListStepsByFunnelRow
	for rows.Next() {
		var i ListStepsByFunnelRow
		if err := rows.Scan(
			&i.ID,
			&i.FunnelID,
			&i.Name,
			&i.Definition,
			&i.Example,
			&i.Action,
			&i.StepOrder,
			&i.CreatedAt,
			&i.LastUpdated,
			&i.DeletedAt,
			&i.ObjectCount,
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

const listTags = `-- name: ListTags :many
SELECT t.id, t.name, t.description, t.color_schema, t.created_at
FROM tag t
WHERE t.org_id = $1
  AND t.deleted_at IS NULL
  AND ($2::text = '' OR (t.name ILIKE '%' || $2 || '%' OR t.description ILIKE '%' || $2 || '%'))
ORDER BY t.created_at DESC
LIMIT $3 OFFSET $4
`

type ListTagsParams struct {
	OrgID   uuid.UUID `json:"org_id"`
	Column2 string    `json:"column_2"`
	Limit   int32     `json:"limit"`
	Offset  int32     `json:"offset"`
}

type ListTagsRow struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	ColorSchema json.RawMessage `json:"color_schema"`
	CreatedAt   time.Time       `json:"created_at"`
}

func (q *Queries) ListTags(ctx context.Context, arg ListTagsParams) ([]ListTagsRow, error) {
	rows, err := q.query(ctx, q.listTagsStmt, listTags,
		arg.OrgID,
		arg.Column2,
		arg.Limit,
		arg.Offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListTagsRow
	for rows.Next() {
		var i ListTagsRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.ColorSchema,
			&i.CreatedAt,
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

const markFeedAsSeen = `-- name: MarkFeedAsSeen :exec
UPDATE feed
SET seen = true
WHERE id = ANY($1::uuid[])
`

func (q *Queries) MarkFeedAsSeen(ctx context.Context, dollar_1 []uuid.UUID) error {
	_, err := q.exec(ctx, q.markFeedAsSeenStmt, markFeedAsSeen, pq.Array(dollar_1))
	return err
}

const updateCreator = `-- name: UpdateCreator :one
UPDATE creator
SET username = $2, profile = $3, role = $4
WHERE id = $1
RETURNING id, username, pwd, profile, role, org_id, active, created_at, deleted_at
`

type UpdateCreatorParams struct {
	ID       uuid.UUID       `json:"id"`
	Username string          `json:"username"`
	Profile  json.RawMessage `json:"profile"`
	Role     string          `json:"role"`
}

func (q *Queries) UpdateCreator(ctx context.Context, arg UpdateCreatorParams) (Creator, error) {
	row := q.queryRow(ctx, q.updateCreatorStmt, updateCreator,
		arg.ID,
		arg.Username,
		arg.Profile,
		arg.Role,
	)
	var i Creator
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.Pwd,
		&i.Profile,
		&i.Role,
		&i.OrgID,
		&i.Active,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const updateFunnel = `-- name: UpdateFunnel :one
UPDATE funnel
SET name = $2, description = $3
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, name, description, creator_id, created_at, deleted_at
`

type UpdateFunnelParams struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
}

func (q *Queries) UpdateFunnel(ctx context.Context, arg UpdateFunnelParams) (Funnel, error) {
	row := q.queryRow(ctx, q.updateFunnelStmt, updateFunnel, arg.ID, arg.Name, arg.Description)
	var i Funnel
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.CreatorID,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const updateObjStep = `-- name: UpdateObjStep :exec
UPDATE obj_step
SET step_id = $2
WHERE step_id = $1
`

type UpdateObjStepParams struct {
	StepID   uuid.UUID `json:"step_id"`
	StepID_2 uuid.UUID `json:"step_id_2"`
}

func (q *Queries) UpdateObjStep(ctx context.Context, arg UpdateObjStepParams) error {
	_, err := q.exec(ctx, q.updateObjStepStmt, updateObjStep, arg.StepID, arg.StepID_2)
	return err
}

const updateObject = `-- name: UpdateObject :one
UPDATE obj
SET name = $2, description = $3, id_string = $4
WHERE id = $1
RETURNING id, name, description, id_string, creator_id, created_at, deleted_at
`

type UpdateObjectParams struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IDString    string    `json:"id_string"`
}

func (q *Queries) UpdateObject(ctx context.Context, arg UpdateObjectParams) (Obj, error) {
	row := q.queryRow(ctx, q.updateObjectStmt, updateObject,
		arg.ID,
		arg.Name,
		arg.Description,
		arg.IDString,
	)
	var i Obj
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.IDString,
		&i.CreatorID,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}

const updateObjectType = `-- name: UpdateObjectType :one
UPDATE obj_type
SET name = $2, description = $3, fields = $4
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, name, description, fields, creator_id, created_at, deleted_at, fields_search
`

type UpdateObjectTypeParams struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Fields      json.RawMessage `json:"fields"`
}

func (q *Queries) UpdateObjectType(ctx context.Context, arg UpdateObjectTypeParams) (ObjType, error) {
	row := q.queryRow(ctx, q.updateObjectTypeStmt, updateObjectType,
		arg.ID,
		arg.Name,
		arg.Description,
		arg.Fields,
	)
	var i ObjType
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.Fields,
		&i.CreatorID,
		&i.CreatedAt,
		&i.DeletedAt,
		&i.FieldsSearch,
	)
	return i, err
}

const updateStep = `-- name: UpdateStep :one
UPDATE step
SET name = $2, definition = $3, example = $4, action = $5, step_order = $6, last_updated = CURRENT_TIMESTAMP
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, funnel_id, name, definition, example, action, step_order, created_at, last_updated, deleted_at
`

type UpdateStepParams struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	Definition string    `json:"definition"`
	Example    string    `json:"example"`
	Action     string    `json:"action"`
	StepOrder  int32     `json:"step_order"`
}

func (q *Queries) UpdateStep(ctx context.Context, arg UpdateStepParams) (Step, error) {
	row := q.queryRow(ctx, q.updateStepStmt, updateStep,
		arg.ID,
		arg.Name,
		arg.Definition,
		arg.Example,
		arg.Action,
		arg.StepOrder,
	)
	var i Step
	err := row.Scan(
		&i.ID,
		&i.FunnelID,
		&i.Name,
		&i.Definition,
		&i.Example,
		&i.Action,
		&i.StepOrder,
		&i.CreatedAt,
		&i.LastUpdated,
		&i.DeletedAt,
	)
	return i, err
}

const updateTag = `-- name: UpdateTag :one
UPDATE tag
SET description = $2, color_schema = $3
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, name, description, color_schema, org_id, created_at, deleted_at
`

type UpdateTagParams struct {
	ID          uuid.UUID       `json:"id"`
	Description string          `json:"description"`
	ColorSchema json.RawMessage `json:"color_schema"`
}

func (q *Queries) UpdateTag(ctx context.Context, arg UpdateTagParams) (Tag, error) {
	row := q.queryRow(ctx, q.updateTagStmt, updateTag, arg.ID, arg.Description, arg.ColorSchema)
	var i Tag
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.ColorSchema,
		&i.OrgID,
		&i.CreatedAt,
		&i.DeletedAt,
	)
	return i, err
}
