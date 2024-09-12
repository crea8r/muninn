package middleware

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/crea8r/muninn/server/internal/database"
)

type responseWriter struct {
    http.ResponseWriter
    body *bytes.Buffer
}

func (rw *responseWriter) Write(b []byte) (int, error) {
    rw.body.Write(b)
    return rw.ResponseWriter.Write(b)
}

func Feed(queries *database.Queries) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Only record feed for specific actions
            if !shouldRecordFeed(r) {
                next.ServeHTTP(w, r)
                return
            }

            creator := r.Context().Value("creator").(database.Creator)

            // Create a new response writer to capture the response
            buf := &bytes.Buffer{}
            rw := &responseWriter{ResponseWriter: w, body: buf}

            // Call the next handler
            next.ServeHTTP(rw, r)

            // After the handler has been called, create the feed entry
            feedContent := generateFeedContent(r, rw)

            contentJSON, err := json.Marshal(feedContent)
            if err != nil {
                log.Printf("Error marshalling feed content: %v", err)
                return
            }

            _, err = queries.CreateFeed(context.Background(), database.CreateFeedParams{
                CreatorID: creator.ID,
                Content:   contentJSON,
                Seen:      false,
            })

            if err != nil {
                log.Printf("Error creating feed: %v", err)
            }
        })
    }
}

func shouldRecordFeed(r *http.Request) bool {
    // Define which routes and methods should be recorded in the feed
    recordableRoutes := map[string][]string{
        "/api/objects": {"POST", "PUT", "DELETE"},
        "/api/funnels": {"POST", "PUT", "DELETE"},
        "/api/creators": {"POST", "PUT", "DELETE"},
    }

    for route, methods := range recordableRoutes {
        if strings.HasPrefix(r.URL.Path, route) {
            for _, method := range methods {
                if r.Method == method {
                    return true
                }
            }
        }
    }

    return false
}

func generateFeedContent(r *http.Request, rw *responseWriter) map[string]interface{} {
    var responseBody map[string]interface{}
    err := json.Unmarshal(rw.body.Bytes(), &responseBody)
    if err != nil {
        log.Printf("Error unmarshalling response body: %v", err)
    }

    action := getActionFromMethod(r.Method)
    resourceType := getResourceTypeFromPath(r.URL.Path)
    resourceName := getResourceNameFromResponse(responseBody)

    return map[string]interface{}{
        "text": fmt.Sprintf("%s %s: %s", action, resourceType, resourceName),
        "url":  r.URL.Path,
        "details": map[string]interface{}{
            "method":   r.Method,
            "path":     r.URL.Path,
            "response": responseBody,
        },
    }
}

func getActionFromMethod(method string) string {
    switch method {
    case "POST":
        return "Created"
    case "PUT":
        return "Updated"
    case "DELETE":
        return "Deleted"
    default:
        return "Acted on"
    }
}

func getResourceTypeFromPath(path string) string {
    parts := strings.Split(path, "/")
    if len(parts) > 2 {
        return strings.Title(parts[2])
    }
    return "Resource"
}

func getResourceNameFromResponse(response map[string]interface{}) string {
    if name, ok := response["name"].(string); ok {
        return name
    }
    return "Unknown"
}