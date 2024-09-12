package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/crea8r/muninn/server/internal/database"
)

type CacheEntry struct {
	Response    []byte
	LastUpdated time.Time
}

var (
	cache     = make(map[string]CacheEntry)
	cacheMutex sync.RWMutex
)

func Cache(db *database.Queries) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cacheKey := r.URL.String() + r.Header.Get("Authorization")

			cacheMutex.RLock()
			entry, found := cache[cacheKey]
			cacheMutex.RUnlock()

			if found && time.Since(entry.LastUpdated) < 2*time.Minute {
				w.Write(entry.Response)
				return
			}

			// Create a custom ResponseWriter to capture the response
			crw := &CustomResponseWriter{ResponseWriter: w}
			next.ServeHTTP(crw, r)

			// Cache the response
			cacheMutex.Lock()
			cache[cacheKey] = CacheEntry{
				Response:    crw.body,
				LastUpdated: time.Now(),
			}
			cacheMutex.Unlock()
		})
	}
}

type CustomResponseWriter struct {
	http.ResponseWriter
	body []byte
}

func (crw *CustomResponseWriter) Write(b []byte) (int, error) {
	crw.body = append(crw.body, b...)
	return crw.ResponseWriter.Write(b)
}