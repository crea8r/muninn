package ports

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type RouterRegistrar interface {
	RegisterRoutes(r chi.Router, wrapWithFeed func(http.HandlerFunc) http.HandlerFunc)
}