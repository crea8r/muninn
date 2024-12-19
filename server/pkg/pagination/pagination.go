package pagination

import (
	"fmt"
	"net/http"
	"strconv"
)

type Params struct {
	Page     int32
	PageSize int32
}

// PaginatedResult represents a generic paginated result
type PaginatedResult[T any] struct {
	Items      []T   `json:"items"`
	TotalCount interface{} `json:"total_count"`
	Page       int32 `json:"page"`
	PageSize   int32 `json:"page_size"`
}

func NewParams(r *http.Request) Params {
	page := 1
	pageSize := 10 // Default page size

	if p := r.URL.Query().Get("page"); p != "" {
		if parsedPage, err := strconv.Atoi(p); err == nil && parsedPage > 0 {
			page = parsedPage
		}
	}

	if ps := r.URL.Query().Get("pageSize"); ps != "" {
		if parsedSize, err := strconv.Atoi(ps); err == nil && parsedSize > 0 {
			pageSize = parsedSize
		}
	}

	return Params{
		Page:     int32(page),
		PageSize: int32(pageSize),
	}
}

// GetOffset calculates the offset for SQL queries
func (p Params) GetOffset() int32 {
	return (p.Page - 1) * p.PageSize
}

func (p Params) Validate() error {
	if p.Page < 1 {
		return fmt.Errorf("page must be greater than 0")
	}
	if p.PageSize < 1 {
		return fmt.Errorf("page size must be greater than 0")
	}
	if p.PageSize > 100 {
		return fmt.Errorf("page size must not exceed 100")
	}
	return nil
}