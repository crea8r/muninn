// pagination/types.go
package pagination

import (
	"fmt"
)

// PaginatedResult represents a generic paginated result
type PaginatedResult[T any] struct {
    Items      []T   `json:"items"`
    TotalCount int64 `json:"total_count"`
    Page       int32 `json:"page"`
    PageSize   int32 `json:"page_size"`
}

// Params represents common pagination parameters
type Params struct {
    Page     int32 `json:"page"`
    PageSize int32 `json:"page_size"`
}

// Validate checks if pagination parameters are valid
func (p Params) Validate() error {
    if p.Page < 1 {
        return fmt.Errorf("page must be greater than 0")
    }
    if p.PageSize < 1 {
        return fmt.Errorf("page_size must be greater than 0")
    }
    if p.PageSize > 100 {
        return fmt.Errorf("page_size cannot exceed 100")
    }
    return nil
}

// GetOffset calculates the offset for SQL queries
func (p Params) GetOffset() int32 {
    return (p.Page - 1) * p.PageSize
}