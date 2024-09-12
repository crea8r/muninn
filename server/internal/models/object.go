package models

import (
	"database/sql"
	"time"
)

type Object struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Description sql.NullString `json:"description"`
	IDString    string         `json:"id_string"`
	CreatorID   string         `json:"creator_id"`
	CreatedAt   time.Time      `json:"created_at"`
	DeletedAt   sql.NullTime   `json:"deleted_at"`
}