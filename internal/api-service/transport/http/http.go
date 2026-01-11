package http

import (
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/justinas/alice"

	apiservice "github.com/danilovid/linkkeeper/internal/api-service"
	"github.com/danilovid/linkkeeper/pkg/logger"
)

type Server struct {
	uc      apiservice.LinkService
	router  *mux.Router
	handler http.Handler
}

func NewServer(uc apiservice.LinkService) *Server {
	r := mux.NewRouter()
	s := &Server{
		uc:     uc,
		router: r,
	}
	s.routes()
	return s
}

func (s *Server) Handler() http.Handler {
	return s.handler
}

func (s *Server) routes() {
	s.router.StrictSlash(true)

	// corsOpts := cors.Options{
	// 	AllowedOrigins: []string{"*"},
	// 	AllowedMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
	// 	AllowedHeaders: []string{"Origin", "Accept", "Content-Type", "X-Requested-With", "Authorization", "X-Auth-Key"},
	// }

	s.handler = alice.New(
		requestLogger,
	).Then(s.router)

	s.router.HandleFunc("/health", Health).Methods(http.MethodGet)

	api := s.router.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/links", s.Create()).Methods(http.MethodPost)
	api.HandleFunc("/links", s.List()).Methods(http.MethodGet)
	api.HandleFunc("/links/random", s.Random()).Methods(http.MethodGet)
	api.HandleFunc("/links/{id}", s.Get()).Methods(http.MethodGet)
	api.HandleFunc("/links/{id}", s.Update()).Methods(http.MethodPatch)
	api.HandleFunc("/links/{id}", s.Delete()).Methods(http.MethodDelete)
	api.HandleFunc("/links/{id}/viewed", s.MarkViewed()).Methods(http.MethodPost)
}

func requestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		logger.L().Info().
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Dur("duration", time.Since(start)).
			Msg("request")
	})
}
