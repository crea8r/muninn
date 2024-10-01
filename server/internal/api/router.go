package api

import (
	"net/http"

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
	objStepHandler := handlers.NewObjStepHandler(objectModel)
	factHandler := handlers.NewFactHandler(db)
	taskHandler := handlers.NewTaskHandler(db)
	orgMemberHandler := handlers.NewOrgMemberHandler(db)
	feedHandler := handlers.NewFeedHandler(db)
	summarizeHandler := handlers.NewSummarizeHandler(db)

	// Public routes
	r.Post("/auth/signup", handlers.SignUp(db))
	r.Post("/auth/login", handlers.Login(db))

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.Permission)

		wrapWithFeed := func(handler http.HandlerFunc) http.HandlerFunc {
			return func(w http.ResponseWriter, r *http.Request) {
				rw := middleware.NewResponseWriter(w)
				handler.ServeHTTP(rw, r)

				// Only create feed entry if the response was successful (status code < 400)
				if rw.Status() < 400 {
					middleware.CreateFeedEntry(db, r, rw)
				}
			}
		}

		r.Route("/setting/tags", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Post("/", tagHandler.CreateTag)
			r.Get("/", tagHandler.ListTags)
			r.Put("/{id}", tagHandler.UpdateTag)
			r.Delete("/{id}", tagHandler.DeleteTag)
		})

		r.Route("/setting/object-types", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Post("/", wrapWithFeed(objectTypeHandler.CreateObjectType))
			r.Get("/", objectTypeHandler.ListObjectTypes)
			r.Put("/{id}", objectTypeHandler.UpdateObjectType)
			r.Delete("/{id}", objectTypeHandler.DeleteObjectType)
			r.Post("/{typeID}/advance", objectHandler.ListObjectsByTypeWithAdvancedFilter)
		})

		r.Route("/setting/funnels", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Post("/", wrapWithFeed(funnelHandler.CreateFunnel))
			r.Get("/", funnelHandler.ListFunnels)
			r.Put("/{id}", funnelHandler.UpdateFunnel)
			r.Delete("/{id}", funnelHandler.DeleteFunnel)
			r.Get("/{id}/view", funnelHandler.GetFunnelView)
		})
			
		r.Route("/objects", func(r chi.Router) {
			r.Use(middleware.Permission)
			// Object routes
			r.Post("/", wrapWithFeed(objectHandler.Create))
			r.Get("/", objectHandler.List)
			r.Get("/{id}", objectHandler.GetDetails)
			r.Put("/{id}", wrapWithFeed(objectHandler.Update))
			r.Delete("/{id}", objectHandler.Delete)
			// Tag routes
			r.Post("/{id}/tags", objectHandler.AddTag)
			r.Delete("/{id}/tags/{tagId}", objectHandler.RemoveTag)

			// Object type value routes
			r.Post("/{id}/type-values", wrapWithFeed(objectHandler.AddObjectTypeValue))
			r.Put("/{id}/type-values/{typeValueId}", objectHandler.UpdateObjectTypeValue)
			r.Delete("/{id}/type-values/{typeValueId}", objectHandler.RemoveObjectTypeValue)

			// Object step routes
			r.Post("/steps", wrapWithFeed(objStepHandler.Create))
			r.Delete("/steps/{id}", objStepHandler.SoftDelete)
			r.Delete("/steps/{id}/force", objStepHandler.HardDelete)
			r.Put("/steps/{id}/sub-status", objStepHandler.UpdateSubStatus)
		})
		
		r.Route("/facts", func(r chi.Router) {
			r.Post("/", factHandler.Create)
			r.Get("/", factHandler.List)
			r.Route("/{id}", func(r chi.Router) {
				r.Put("/", factHandler.Update)
				r.Delete("/", factHandler.Delete)
			})
		})

		r.Route("/tasks", func(r chi.Router) {
			r.Use(middleware.Permission)
			// Only admin can access this route; later implement permission check
			// r.Get("/", taskHandler.ListAllTasksInOrg)
			r.Get("/", taskHandler.ListWithFilter)
			r.Post("/", wrapWithFeed(taskHandler.Create))
			r.Get("/object/{objectID}", taskHandler.ListByObjectID)
			r.Route("/{id}", func(r chi.Router) {
				r.Get("/", taskHandler.GetByID)
				r.Put("/", wrapWithFeed(taskHandler.Update))
				r.Delete("/", taskHandler.Delete)
			})
		})

		r.Route("/org", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Get("/members", orgMemberHandler.ListOrgMembers)
			r.Put("/details", orgMemberHandler.UpdateOrgDetails)
			r.Post("/members", wrapWithFeed(orgMemberHandler.AddNewMember))
			r.Put("/members/{userID}/permission", orgMemberHandler.UpdateUserRoleAndStatus)
			r.Put("/members/{userID}/password", orgMemberHandler.UpdateUserPassword)
			r.Put("/members/{userID}/profile", orgMemberHandler.UpdateUserProfile)
		})

		r.Route("/feeds", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Get("/", feedHandler.ListFeeds)
			r.Post("/seen", feedHandler.MarkFeedsAsSeen)
		})

		r.Route("/summarize", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Get("/personal", summarizeHandler.PersonalSummarize);
		})
	})
	
	return r
}