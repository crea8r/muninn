package models

import (
	"database/sql"
	"time"
)

type Funnel struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Description sql.NullString `json:"description"`
	CreatorID   string         `json:"creator_id"`
	CreatedAt   time.Time      `json:"created_at"`
	DeletedAt   sql.NullTime   `json:"deleted_at"`
}

type Step struct {
	ID          string         `json:"id"`
	FunnelID    string         `json:"funnel_id"`
	Name        string         `json:"name"`
	Definition  sql.NullString `json:"definition"`
	Example     sql.NullString `json:"example"`
	Action      sql.NullString `json:"action"`
	ParentStep  sql.NullString `json:"parent_step"`
	CreatedAt   time.Time      `json:"created_at"`
	LastUpdated time.Time      `json:"last_updated"`
	DeletedAt   sql.NullTime   `json:"deleted_at"`
}