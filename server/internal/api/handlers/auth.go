package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type signUpRequest struct {
	OrgName  string `json:"org_name"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type authResponse struct {
	Token string `json:"token"`
}

func SignUp(db *database.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req signUpRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Create organization
		org, err := db.CreateOrganization(r.Context(), database.CreateOrganizationParams{
			Name:    req.OrgName,
			Profile: json.RawMessage(`{}`), // Empty JSON object for now
		})
		if err != nil {
			http.Error(w, "Failed to create organization", http.StatusInternalServerError)
			return
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		// Create admin user
		_, err = db.CreateCreator(r.Context(), database.CreateCreatorParams{
			Username: req.Username,
			Pwd:      string(hashedPassword),
			Profile:  json.RawMessage(`{}`), // Empty JSON object for now
			Role:     "admin",
			OrgID:    org.ID,
			Active:   true,
		})
		if err != nil {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

func Login(db *database.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req loginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Get creator
		creator, err := db.GetCreatorByUsername(r.Context(), database.GetCreatorByUsernameParams{
			Username: req.Username,
			Active:   true,
		})
		if err != nil {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		// Check password
		if err := bcrypt.CompareHashAndPassword([]byte(creator.Pwd), []byte(req.Password)); err != nil {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		// Create JWT token
		claims := &middleware.Claims{
			OrgID: creator.OrgID.String(),
			Role:  creator.Role,
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(30 * 24 * time.Hour)),
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		signedToken, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(authResponse{Token: signedToken})
	}
}