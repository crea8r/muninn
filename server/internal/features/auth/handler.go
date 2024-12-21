package auth

import (
	"encoding/json"
	"net/http"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/internal/features/auth/service"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type Handler struct {
	s *service.Service
}

func NewHandler(db *database.Queries) *Handler {
	return &Handler{
		s: service.NewService(db),
	}
}

func (h *Handler) RegisterRoutes(r chi.Router, wrapWithFeed func(http.HandlerFunc) http.HandlerFunc) {
	r.Post("/auth/signup", h.SignUp)
	r.Post("/auth/login", h.Login)
	r.Post("/auth/robotlogin", h.RobotLogin)

	r.Route("/org", func(r chi.Router) {
		r.Use(middleware.Permission)
		r.Get("/members", h.ListOrgCreators)
		r.Put("/details", h.UpdateOrgDetails)
		r.Post("/members", wrapWithFeed(h.AddNewOrgCreator))
		r.Put("/members/{userID}/permission", h.UpdateCreatorRoleAndStatus)
		r.Put("/members/{userID}/password", h.UpdateCreatorPassword)
		r.Put("/members/{userID}/profile", h.UpdateCreatorProfile)
	})
}

/* auth route */
func (h *Handler) SignUp(w http.ResponseWriter, r *http.Request){
	var req SignUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	_, err := h.s.SignUp(r.Context(), req.OrgName, req.Password, req.Username);
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	signedToken, err := h.s.Login(r.Context(), req.Username, req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	json.NewEncoder(w).Encode(AuthResponse{Token: signedToken})
}

func (h *Handler) RobotLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	signedToken, err := h.s.RobotLogin(r.Context(), req.Username, req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	json.NewEncoder(w).Encode(AuthResponse{Token: signedToken})
}

/* manage org */
func (h *Handler) ListOrgCreators(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	search := r.URL.Query().Get("search")
	creators, err := h.s.ListOrgCreators(ctx, search)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(creators)
}

func (h *Handler) UpdateOrgDetails(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req UpdateOrgDetailsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	org, err := h.s.UpdateOrgDetails(ctx, req.Name, req.Profile)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(org)
}

func (h *Handler) AddNewOrgCreator(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req AddNewOrgCreatorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	creator, err := h.s.AddNewOrgCreator(ctx, req.Username, req.Password, req.Role, req.Profile)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(creator)
}

/* creator profile */
func (h *Handler) UpdateCreatorRoleAndStatus(w http.ResponseWriter, r *http.Request) {
	userIDString := chi.URLParam(r, "userID");
	UserID := uuid.MustParse(userIDString)
	var req UpdateCreatorRoleAndStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	Role := req.Role
	Status := req.Status
	_, err := h.s.UpdateCreatorRoleAndStatus(r.Context(), UserID, Role, Status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) UpdateCreatorPassword(w http.ResponseWriter, r *http.Request) {
	userIDString := chi.URLParam(r, "userID");
	UserID := uuid.MustParse(userIDString)
	var req UpdateCreatorPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	NewPassword := req.NewPassword
	updatedUser, err := h.s.UpdateCreatorPassword(r.Context(), UserID, NewPassword)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(updatedUser)
}

func (h *Handler) UpdateCreatorProfile(w http.ResponseWriter, r *http.Request) {
	userIDString := chi.URLParam(r, "userID");
	UserID := uuid.MustParse(userIDString)
	var req UpdateCreatorProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	Profile := req.Profile
	updatedUser, err := h.s.UpdateCreatorProfile(r.Context(), UserID, Profile)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(updatedUser)
}