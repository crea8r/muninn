package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type OrgMemberHandler struct {
	db *database.Queries
}

func NewOrgMemberHandler(db *database.Queries) *OrgMemberHandler {
	return &OrgMemberHandler{db: db}
}

func (h *OrgMemberHandler) ListOrgMembers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	orgID := getOrgIDFromContext(ctx)
	search := r.URL.Query().Get("search")
	
	members, err := h.db.ListOrgMembers(ctx, database.ListOrgMembersParams{
		OrgID: orgID,
		Column2: search,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(members)
}

func (h *OrgMemberHandler) UpdateOrgDetails(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	orgID := getOrgIDFromContext(ctx)
	
	if !isAdmin(ctx) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req struct {
		Name    string          `json:"name"`
		Profile json.RawMessage `json:"profile"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	updatedOrg, err := h.db.UpdateOrgDetails(ctx, database.UpdateOrgDetailsParams{
		ID:      orgID,
		Name:    req.Name,
		Profile: req.Profile,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(updatedOrg)
}

func (h *OrgMemberHandler) AddNewMember(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	orgID := getOrgIDFromContext(ctx)
	
	if !isAdmin(ctx) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req struct {
		Username string          `json:"username"`
		Password string          `json:"password"`
		Role     string          `json:"role"`
		Profile  json.RawMessage `json:"profile"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Hash the password before storing
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		http.Error(w, "Failed to process password", http.StatusInternalServerError)
		return
	}

	newMember, err := h.db.CreateCreator(ctx, database.CreateCreatorParams{
		Username: req.Username,
		Pwd:      hashedPassword,
		Profile:  req.Profile,
		Role:     req.Role,
		OrgID:    orgID,
		Active:   true,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(newMember)
}

func (h *OrgMemberHandler) UpdateUserRoleAndStatus(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	orgID := getOrgIDFromContext(ctx)

	if !isAdmin(ctx) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	userID := uuid.MustParse(chi.URLParam(r, "userID"))

	var req struct {
		Role string `json:"role"`
		Active bool `json:"active"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	updatedUser, err := h.db.UpdateUserRoleAndStatus(ctx, database.UpdateUserRoleAndStatusParams{
		ID:    userID,
		Role:  req.Role,
		Active: req.Active,
		OrgID: orgID,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(updatedUser)
}

func (h *OrgMemberHandler) UpdateUserPassword(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	currentUserID := getUserIDFromContext(ctx)
	
	userID := uuid.MustParse(chi.URLParam(r, "userID"))

	// Check if the current user is an admin or is updating their own password
	if !isAdmin(ctx) && currentUserID != userID {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req struct {
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Hash the new password
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		http.Error(w, "Failed to process password", http.StatusInternalServerError)
		return
	}

	if err := h.db.UpdateUserPassword(ctx, database.UpdateUserPasswordParams{
		ID:  userID,
		Pwd: hashedPassword,
	}); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *OrgMemberHandler) UpdateUserProfile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	currentUserID := getUserIDFromContext(ctx)
	
	userID := uuid.MustParse(chi.URLParam(r, "userID"))

	// Users can only update their own profile
	if currentUserID != userID {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req struct {
		Profile json.RawMessage `json:"profile"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate profile format
	var profile struct {
		Avatar   string `json:"avatar"`
		Email    string `json:"email"`
		FullName string `json:"fullname"`
	}
	if err := json.Unmarshal(req.Profile, &profile); err != nil {
		http.Error(w, "Invalid profile format", http.StatusBadRequest)
		return
	}

	updatedUser, err := h.db.UpdateUserProfile(ctx, database.UpdateUserProfileParams{
		ID:      userID,
		Profile: req.Profile,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(updatedUser)
}

// Helper functions

func getOrgIDFromContext(ctx context.Context) (uuid.UUID) {
	claims := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	return uuid.MustParse(claims.OrgID)
}

func getUserIDFromContext(ctx context.Context) (uuid.UUID) {
	claims := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	return uuid.MustParse(claims.CreatorID)
}

func isAdmin(ctx context.Context) bool {
	claims := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	if claims.Role == "admin" {
		return true
	}
	return false
}

func hashPassword(password string) (string, error) {
	// Implement this function to hash the password
	// You can use a library like bcrypt for this
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hashedPassword), err
}