// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package database

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/sqlc-dev/pqtype"
)

type AutomatedAction struct {
	ID           uuid.UUID       `json:"id"`
	OrgID        uuid.UUID       `json:"org_id"`
	Name         string          `json:"name"`
	Description  string          `json:"description"`
	FilterConfig json.RawMessage `json:"filter_config"`
	ActionConfig json.RawMessage `json:"action_config"`
	IsActive     bool            `json:"is_active"`
	LastRunAt    sql.NullTime    `json:"last_run_at"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
	CreatedBy    uuid.UUID       `json:"created_by"`
	DeletedAt    sql.NullTime    `json:"deleted_at"`
}

type AutomatedActionExecution struct {
	ID              uuid.UUID             `json:"id"`
	ActionID        uuid.UUID             `json:"action_id"`
	StartedAt       time.Time             `json:"started_at"`
	CompletedAt     sql.NullTime          `json:"completed_at"`
	Status          string                `json:"status"`
	ObjectsAffected int32                 `json:"objects_affected"`
	ErrorMessage    sql.NullString        `json:"error_message"`
	ExecutionLog    pqtype.NullRawMessage `json:"execution_log"`
}

type Creator struct {
	ID        uuid.UUID       `json:"id"`
	Username  string          `json:"username"`
	Pwd       string          `json:"pwd"`
	Profile   json.RawMessage `json:"profile"`
	Role      string          `json:"role"`
	OrgID     uuid.UUID       `json:"org_id"`
	Active    bool            `json:"active"`
	CreatedAt time.Time       `json:"created_at"`
	DeletedAt sql.NullTime    `json:"deleted_at"`
}

type CreatorList struct {
	ID          uuid.UUID       `json:"id"`
	CreatorID   uuid.UUID       `json:"creator_id"`
	ListID      uuid.UUID       `json:"list_id"`
	Params      json.RawMessage `json:"params"`
	CreatedAt   time.Time       `json:"created_at"`
	LastUpdated time.Time       `json:"last_updated"`
}

type CreatorSession struct {
	ID        uuid.UUID `json:"id"`
	CreatorID uuid.UUID `json:"creator_id"`
	Jwt       string    `json:"jwt"`
	ExpiredAt time.Time `json:"expired_at"`
	CreatedAt time.Time `json:"created_at"`
}

type Fact struct {
	ID          uuid.UUID    `json:"id"`
	Text        string       `json:"text"`
	HappenedAt  sql.NullTime `json:"happened_at"`
	Location    string       `json:"location"`
	CreatorID   uuid.UUID    `json:"creator_id"`
	CreatedAt   time.Time    `json:"created_at"`
	LastUpdated time.Time    `json:"last_updated"`
	DeletedAt   sql.NullTime `json:"deleted_at"`
}

type Feed struct {
	ID        uuid.UUID       `json:"id"`
	CreatorID uuid.UUID       `json:"creator_id"`
	Content   json.RawMessage `json:"content"`
	Seen      bool            `json:"seen"`
	CreatedAt time.Time       `json:"created_at"`
	DeletedAt sql.NullTime    `json:"deleted_at"`
}

type Funnel struct {
	ID          uuid.UUID    `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	CreatorID   uuid.UUID    `json:"creator_id"`
	CreatedAt   time.Time    `json:"created_at"`
	DeletedAt   sql.NullTime `json:"deleted_at"`
}

type ImportTask struct {
	ID            uuid.UUID             `json:"id"`
	OrgID         uuid.UUID             `json:"org_id"`
	CreatorID     uuid.UUID             `json:"creator_id"`
	ObjTypeID     uuid.UUID             `json:"obj_type_id"`
	Status        string                `json:"status"`
	Progress      sql.NullInt32         `json:"progress"`
	TotalRows     int32                 `json:"total_rows"`
	ProcessedRows sql.NullInt32         `json:"processed_rows"`
	ErrorMessage  sql.NullString        `json:"error_message"`
	ResultSummary pqtype.NullRawMessage `json:"result_summary"`
	FileName      string                `json:"file_name"`
	CreatedAt     sql.NullTime          `json:"created_at"`
	UpdatedAt     sql.NullTime          `json:"updated_at"`
}

type List struct {
	ID            uuid.UUID       `json:"id"`
	Name          string          `json:"name"`
	Description   string          `json:"description"`
	FilterSetting json.RawMessage `json:"filter_setting"`
	CreatorID     uuid.UUID       `json:"creator_id"`
	CreatedAt     time.Time       `json:"created_at"`
	LastUpdated   time.Time       `json:"last_updated"`
	DeletedAt     sql.NullTime    `json:"deleted_at"`
}

type Obj struct {
	ID          uuid.UUID    `json:"id"`
	Name        string       `json:"name"`
	Photo       string       `json:"photo"`
	Description string       `json:"description"`
	IDString    string       `json:"id_string"`
	CreatorID   uuid.UUID    `json:"creator_id"`
	CreatedAt   time.Time    `json:"created_at"`
	DeletedAt   sql.NullTime `json:"deleted_at"`
	Aliases     []string     `json:"aliases"`
}

type ObjFact struct {
	ObjID  uuid.UUID `json:"obj_id"`
	FactID uuid.UUID `json:"fact_id"`
}

type ObjStep struct {
	ID          uuid.UUID    `json:"id"`
	ObjID       uuid.UUID    `json:"obj_id"`
	StepID      uuid.UUID    `json:"step_id"`
	CreatorID   uuid.UUID    `json:"creator_id"`
	SubStatus   int32        `json:"sub_status"`
	CreatedAt   time.Time    `json:"created_at"`
	LastUpdated time.Time    `json:"last_updated"`
	DeletedAt   sql.NullTime `json:"deleted_at"`
}

type ObjTag struct {
	ObjID uuid.UUID `json:"obj_id"`
	TagID uuid.UUID `json:"tag_id"`
}

type ObjTask struct {
	ObjID  uuid.UUID `json:"obj_id"`
	TaskID uuid.UUID `json:"task_id"`
}

type ObjType struct {
	ID           uuid.UUID       `json:"id"`
	Name         string          `json:"name"`
	Icon         string          `json:"icon"`
	Description  string          `json:"description"`
	Fields       json.RawMessage `json:"fields"`
	CreatorID    uuid.UUID       `json:"creator_id"`
	CreatedAt    time.Time       `json:"created_at"`
	DeletedAt    sql.NullTime    `json:"deleted_at"`
	FieldsSearch interface{}     `json:"fields_search"`
}

// This table has full-text search capabilities on its JSON data
type ObjTypeValue struct {
	ID          uuid.UUID       `json:"id"`
	ObjID       uuid.UUID       `json:"obj_id"`
	TypeID      uuid.UUID       `json:"type_id"`
	TypeValues  json.RawMessage `json:"type_values"`
	CreatedAt   time.Time       `json:"created_at"`
	LastUpdated time.Time       `json:"last_updated"`
	DeletedAt   sql.NullTime    `json:"deleted_at"`
	// This column contains the tsvector for full-text search
	SearchVector interface{} `json:"search_vector"`
}

type ObjectMergeHistory struct {
	ID              uuid.UUID   `json:"id"`
	TargetObjectID  uuid.UUID   `json:"target_object_id"`
	SourceObjectIds []uuid.UUID `json:"source_object_ids"`
	MergedAt        time.Time   `json:"merged_at"`
	CreatorID       uuid.UUID   `json:"creator_id"`
	CreatedAt       time.Time   `json:"created_at"`
}

type Org struct {
	ID        uuid.UUID       `json:"id"`
	Name      string          `json:"name"`
	Profile   json.RawMessage `json:"profile"`
	CreatedAt time.Time       `json:"created_at"`
	DeletedAt sql.NullTime    `json:"deleted_at"`
}

type Step struct {
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
}

type Tag struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	ColorSchema json.RawMessage `json:"color_schema"`
	OrgID       uuid.UUID       `json:"org_id"`
	CreatedAt   time.Time       `json:"created_at"`
	DeletedAt   sql.NullTime    `json:"deleted_at"`
}

type Task struct {
	ID          uuid.UUID     `json:"id"`
	Content     string        `json:"content"`
	Deadline    sql.NullTime  `json:"deadline"`
	RemindAt    sql.NullTime  `json:"remind_at"`
	Status      string        `json:"status"`
	CreatorID   uuid.UUID     `json:"creator_id"`
	AssignedID  uuid.NullUUID `json:"assigned_id"`
	ParentID    uuid.NullUUID `json:"parent_id"`
	CreatedAt   time.Time     `json:"created_at"`
	LastUpdated time.Time     `json:"last_updated"`
	DeletedAt   sql.NullTime  `json:"deleted_at"`
}
