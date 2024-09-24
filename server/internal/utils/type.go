package utils

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Custom NullTime type that wraps sql.NullTime
type NullTime struct {
	sql.NullTime
}

// Implement UnmarshalJSON to handle null and time formats in JSON
func (nt *NullTime) UnmarshalJSON(b []byte) error {
	// Check for JSON null
	if string(b) == "null" {
		nt.NullTime = sql.NullTime{Valid: false}
		return nil
	}

	// Parse time from JSON string
	var t time.Time
	if err := json.Unmarshal(b, &t); err != nil {
		fmt.Println("error unmarshalling time ",string(b))
		return err
	}

	nt.NullTime = sql.NullTime{Time: t, Valid: true}
	return nil
}

// Implement MarshalJSON to handle null and time formats in JSON
func (nt NullTime) MarshalJSON() ([]byte, error) {
	if !nt.Valid {
		return json.Marshal(nil)
	}
	return json.Marshal(nt.Time)
}

// Custom NullUUID type that wraps uuid.NullUUID
type NullUUID struct {
	uuid.NullUUID
}

// Implement UnmarshalJSON to handle null and UUID formats in JSON
func (nu *NullUUID) UnmarshalJSON(b []byte) error {
	// Check for JSON null
	if string(b) == "null" {
			nu.NullUUID = uuid.NullUUID{Valid: false}
			return nil
	}

	// Parse UUID from JSON string
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
			return err
	}

	u, err := uuid.Parse(s)
	if err != nil {
			return err
	}

	nu.NullUUID = uuid.NullUUID{UUID: u, Valid: true}
	return nil
}

// Implement MarshalJSON to handle null and UUID formats in JSON
func (nu NullUUID) MarshalJSON() ([]byte, error) {
	if !nu.Valid {
			return json.Marshal(nil)
	}
	return json.Marshal(nu.UUID.String())
}