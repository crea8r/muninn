// funnel.go
package models

import (
	"database/sql"
	"time"
)

type Funnel struct {
	ID          string       `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	CreatorID   string       `json:"creator_id"`
	OrgID       string       `json:"org_id"`
	CreatedAt   time.Time    `json:"created_at"`
	DeletedAt   sql.NullTime `json:"deleted_at"`
	Steps       []Step       `json:"steps"`
	ObjectCount int          `json:"object_count"`
}

type Step struct {
	ID          string       `json:"id"`
	FunnelID    string       `json:"funnel_id"`
	Name        string       `json:"name"`
	Definition  string       `json:"definition"`
	Example     string       `json:"example"`
	Action      string       `json:"action"`
	StepOrder   int          `json:"step_order"`
	CreatedAt   time.Time    `json:"created_at"`
	LastUpdated time.Time    `json:"last_updated"`
	DeletedAt   sql.NullTime `json:"deleted_at"`
	ObjectCount int          `json:"object_count"`
}

type FunnelUpdate struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	StepsCreate []Step            `json:"steps_create"`
	StepsUpdate []Step            `json:"steps_update"`
	StepsDelete []string          `json:"steps_delete"`
	StepMapping map[string]string `json:"step_mapping"`
}