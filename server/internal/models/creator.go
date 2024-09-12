package models

import (
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type Creator struct {
	ID        string         `json:"id"`
	Username  string         `json:"username"`
	Password  string         `json:"-"` // Don't expose password in JSON
	Profile   Profile        `json:"profile"`
	Role      string         `json:"role"`
	OrgID     string         `json:"org_id"`
	Active    bool           `json:"active"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt sql.NullTime   `json:"deleted_at"`
}

type Profile json.RawMessage

// Implement sql.Scanner interface
func (p *Profile) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(bytes, &p)
}

// Implement driver.Valuer interface
func (p Profile) Value() (driver.Value, error) {
	return json.Marshal(p)
}