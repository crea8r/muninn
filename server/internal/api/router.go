package api

import (
	"github.com/crea8r/muninn/server/internal/api/handlers"
	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/internal/models"
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

	tagHandler := handlers.NewTagHandler(db)
	objectTypeHandler := handlers.NewObjectTypeHandler(db)
	funnelHandler := handlers.NewFunnelHandler(db)
	objectModel := models.NewObjectModel(db)
	objectHandler := handlers.NewObjectHandler(objectModel, db)

	// Public routes
	r.Post("/auth/signup", handlers.SignUp(db))
	r.Post("/auth/login", handlers.Login(db))

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.Permission)

		r.Route("/setting/tags", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Post("/", tagHandler.CreateTag)
			r.Get("/", tagHandler.ListTags)
			r.Put("/{id}", tagHandler.UpdateTag)
			r.Delete("/{id}", tagHandler.DeleteTag)
		})

		r.Route("/setting/object-types", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Post("/", objectTypeHandler.CreateObjectType)
			r.Get("/", objectTypeHandler.ListObjectTypes)
			r.Put("/{id}", objectTypeHandler.UpdateObjectType)
			r.Delete("/{id}", objectTypeHandler.DeleteObjectType)
		})

		r.Route("/setting/funnels", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Post("/", funnelHandler.CreateFunnel)
			r.Get("/", funnelHandler.ListFunnels)
			r.Put("/{id}", funnelHandler.UpdateFunnel)
			r.Delete("/{id}", funnelHandler.DeleteFunnel)
		})
			
		r.Route("/objects", func(r chi.Router) {
			// Object routes
			r.Post("/", objectHandler.Create)
			r.Get("/", objectHandler.List)
			r.Get("/{id}", objectHandler.GetDetails)
			r.Put("/{id}", objectHandler.Update)
			r.Delete("/{id}", objectHandler.Delete)
			// Tag routes
			r.Post("/{id}/tags", objectHandler.AddTag)
			r.Delete("/{id}/tags/{tagId}", objectHandler.RemoveTag)

			// Object type value routes
			r.Post("/{id}/type-values", objectHandler.AddObjectTypeValue)
			r.Put("/{id}/type-values/{typeValueId}", objectHandler.UpdateObjectTypeValue)
			r.Delete("/{id}/type-values/{typeValueId}", objectHandler.RemoveObjectTypeValue)
		})
	})

	return r
}