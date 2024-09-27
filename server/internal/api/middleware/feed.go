package middleware

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/crea8r/muninn/server/internal/database"
	"github.com/google/uuid"
)

type ResponseWriter struct {
	http.ResponseWriter
	status int
	body   *bytes.Buffer
}

func NewResponseWriter(w http.ResponseWriter) *ResponseWriter {
	return &ResponseWriter{ResponseWriter: w, body: &bytes.Buffer{}}
}

func (rw *ResponseWriter) WriteHeader(statusCode int) {
	rw.status = statusCode
	rw.ResponseWriter.WriteHeader(statusCode)
}

func (rw *ResponseWriter) Write(b []byte) (int, error) {
	rw.body.Write(b)
	return rw.ResponseWriter.Write(b)
}

func (rw *ResponseWriter) Status() int {
	if rw.status == 0 {
		return http.StatusOK
	}
	return rw.status
}
// Design principles?
// TODO: one action can lead to creation of multiple feed entries, 
// balancing the need to create feed entries for all relevant users vs. spamming the feed
// e.g: there is gauage for feed value, if the value is high, then create feed entries for all relevant users
// e.g: 
// creation of a task can lead to creation of feed for creator, assigned and related users 
//  -> user want to see their related tasks
// create & update of a funnel, obj_type can lead to creation of feed for everyone in the organisation 
//  -> user want to see the detail of obj_type,
// create & update & adding facts of an object can lead to creation of feed for everyone in the organisation
//  -> user want to see the detail of object
func CreateFeedEntry(queries *database.Queries, r *http.Request, rw *ResponseWriter) {
	claims := r.Context().Value(UserClaimsKey).(*Claims)
	creatorID := claims.CreatorID

	feedContent := generateFeedContent(r, rw)

	contentJSON, err := json.Marshal(feedContent)
	if err != nil {
		log.Printf("Error marshalling feed content: %v", err)
		return
	}

	_, err = queries.CreateFeed(context.Background(), database.CreateFeedParams{
		CreatorID: uuid.MustParse(creatorID),
		Content:   contentJSON,
		Seen:      false,
	})

	if err != nil {
		log.Printf("Error creating feed: %v", err)
	}
}

func generateFeedContent(r *http.Request, rw *ResponseWriter) map[string]interface{} {
	var responseBody map[string]interface{}
	err := json.Unmarshal(rw.body.Bytes(), &responseBody)
	if err != nil {
		log.Printf("Error unmarshalling response body: %v", err)
	}


	return map[string]interface{}{
		"url":  r.URL.Path,
		"details": map[string]interface{}{
			"method":   r.Method,
			"path":     r.URL.Path,
			"response": responseBody,
		},
	}
}