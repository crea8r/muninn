package api

import (
	"github.com/crea8r/muninn/server/internal/api/handlers"
	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/go-chi/chi/v5"
	"github.com/rs/cors"
)

func SetupRouter(db *database.Queries) *chi.Mux {
	r := chi.NewRouter()

	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // Allow all origins
		//[]string{"http://localhost:3000", "https://yourdomain.com"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	})
	r.Use(corsMiddleware.Handler)

	// Public routes
	r.Post("/auth/signup", handlers.SignUp(db))
	r.Post("/auth/login", handlers.Login(db))

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.Permission)

		// Add your protected routes here
		// For example:
		// r.Get("/objects", handlers.ListObjects(db))
	})

	return r
}