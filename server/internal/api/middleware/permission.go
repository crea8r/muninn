package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Define key for context
var UserClaimsKey = "user_claims"

// Claims holds the JWT claims
// TODO: should remove Name, OrgName, Profile from Claims so user can access to latest value once changed
type Claims struct {
	CreatorID string `json:"creator_id"`
	Name      string `json:"name"`
	OrgID     string `json:"org_id"`
	OrgName	 string `json:"org_name"`
	Role      string `json:"role"`
	Profile	 json.RawMessage `json:"profile"`
	jwt.RegisteredClaims
}

// Permission middleware handles JWT authentication and authorization
func Permission(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get the JWT token from the Authorization header
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Remove "Bearer " prefix if present
		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		}

		// Parse and validate the token
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Check if the token has expired
		if time.Now().After(claims.ExpiresAt.Time) {
			http.Error(w, "Token has expired", http.StatusUnauthorized)
			return
		}

		// Add claims to the request context
		ctx := context.WithValue(r.Context(), UserClaimsKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}