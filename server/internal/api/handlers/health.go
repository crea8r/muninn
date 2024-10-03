package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/crea8r/muninn/server/internal/database"
)

func HealthCheck(db *database.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check if the database connection is alive
		_,err := db.HealthCheck(r.Context())
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": "Database connection failed"})
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "message": "Server is healthy"})
	}
}