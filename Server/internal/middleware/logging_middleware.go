package middleware

import (
	"net/http"
	"time"

	"trading-platform-backend/internal/logging"
)

// LoggingMiddleware logs each request.
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		next.ServeHTTP(w, r)

		logging.Logger.Infof("Method: %s | Path: %s | Duration: %s", r.Method, r.URL.Path, time.Since(start))
	})
}
