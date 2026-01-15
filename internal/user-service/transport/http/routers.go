package http

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/justinas/alice"
	"github.com/rs/cors"

	"github.com/danilovid/linkkeeper/pkg/logger"
)

func (s *Server) routes() http.Handler {
	r := mux.NewRouter()

	// Middleware
	middleware := alice.New(
		logRequest,
		cors.New(cors.Options{
			AllowedOrigins:   []string{"*"},
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowedHeaders:   []string{"*"},
			AllowCredentials: true,
		}).Handler,
	)

	// API v1 routes
	api := r.PathPrefix("/api/v1").Subrouter()

	// User routes
	api.HandleFunc("/users", s.GetOrCreateUser).Methods("POST")
	api.HandleFunc("/users/{id}", s.GetUserByID).Methods("GET")
	api.HandleFunc("/users/telegram/{telegram_id}", s.GetUserByTelegramID).Methods("GET")
	api.HandleFunc("/users/telegram/{telegram_id}/exists", s.CheckUserExists).Methods("GET")

	// Health check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	return middleware.Then(r)
}

func logRequest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logger.L().Info().
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Msg("request")
		next.ServeHTTP(w, r)
	})
}
