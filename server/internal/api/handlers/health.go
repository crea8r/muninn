package handlers

import (
	"encoding/json"
	"net/http"
	"os/exec"
	"strings"
	"time"

	"github.com/crea8r/muninn/server/internal/database"
)

// GitInfo holds the branch name and latest commit time
type GitInfo struct {
	Branch     string `json:"branch"`
	LastCommit string `json:"lastCommit"`
}

// getGitInfo retrieves the current Git branch and latest commit time
func getGitInfo() (*GitInfo, error) {
	// Get the current branch name
	branchCmd := exec.Command("git", "rev-parse", "--abbrev-ref", "HEAD")
	branchOutput, err := branchCmd.Output()
	if err != nil {
		return nil, err
	}
	branch := strings.TrimSpace(string(branchOutput))

	// Get the latest commit time
	commitCmd := exec.Command("git", "log", "-1", "--format=%cd", "--date=iso")
	commitOutput, err := commitCmd.Output()
	if err != nil {
		return nil, err
	}
	commitTime, err := time.Parse("2006-01-02 15:04:05 -0700", strings.TrimSpace(string(commitOutput)))
	if err != nil {
		return nil, err
	}

	return &GitInfo{
		Branch:     branch,
		LastCommit: commitTime.Format(time.RFC3339),
	}, nil
}

func HealthCheck(db *database.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check if the database connection is alive
		_, err := db.HealthCheck(r.Context())
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": "Database connection failed"})
			return
		}

		// Get Git information
		gitInfo, err := getGitInfo()
		if err != nil {
			gitInfo = &GitInfo{Branch: "unknown", LastCommit: "unknown"}
		}

		// Prepare the response
		response := map[string]interface{}{
			"status":  "ok",
			"message": "Server is healthy",
			"git": map[string]string{
				"branch":     gitInfo.Branch,
				"lastCommit": gitInfo.LastCommit,
			},
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
	}
}