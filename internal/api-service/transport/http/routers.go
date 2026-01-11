package http

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"

	apiservice "github.com/danilovid/linkkeeper/internal/api-service"
)

type createLinkRequest struct {
	URL      string `json:"url"`
	Resource string `json:"resource"`
}

type updateLinkRequest struct {
	URL      *string `json:"url"`
	Resource *string `json:"resource"`
}

type linkResponse struct {
	ID        string     `json:"id"`
	URL       string     `json:"url"`
	Resource  string     `json:"resource,omitempty"`
	Views     int64      `json:"views"`
	ViewedAt  *time.Time `json:"viewed_at,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

func Health(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
}

func (s *Server) Create() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createLinkRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}
	req.URL = strings.TrimSpace(req.URL)
	req.Resource = strings.TrimSpace(req.Resource)
	input := apiservice.LinkCreateInput{
		URL:      req.URL,
		Resource: req.Resource,
	}
		link, err := s.uc.Create(r.Context(), input)
		if err != nil {
			writeError(w, err)
			return
		}
		writeJSON(w, http.StatusCreated, toLinkResponse(link))
	}
}

func (s *Server) Get() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		link, err := s.uc.GetByID(r.Context(), id)
		if err != nil {
			writeError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, toLinkResponse(link))
	}
}

func (s *Server) List() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		limit := parseIntDefault(r.URL.Query().Get("limit"), 50)
		offset := parseIntDefault(r.URL.Query().Get("offset"), 0)
		if limit > 200 {
			limit = 200
		}
		links, err := s.uc.List(r.Context(), limit, offset)
		if err != nil {
			writeError(w, err)
			return
		}
		resp := make([]linkResponse, 0, len(links))
		for _, link := range links {
			resp = append(resp, toLinkResponse(link))
		}
		writeJSON(w, http.StatusOK, resp)
	}
}

func (s *Server) Update() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		var req updateLinkRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}
	if req.URL != nil {
		trimmed := strings.TrimSpace(*req.URL)
		req.URL = &trimmed
	}
	if req.Resource != nil {
		trimmed := strings.TrimSpace(*req.Resource)
		req.Resource = &trimmed
	}
	input := apiservice.LinkUpdateInput{
		URL:      req.URL,
		Resource: req.Resource,
	}
		link, err := s.uc.Update(r.Context(), id, input)
		if err != nil {
			writeError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, toLinkResponse(link))
	}
}

func (s *Server) Delete() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		if err := s.uc.Delete(r.Context(), id); err != nil {
			writeError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func (s *Server) MarkViewed() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		link, err := s.uc.MarkViewed(r.Context(), id)
		if err != nil {
			writeError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, toLinkResponse(link))
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, apiservice.ErrNotFound):
		http.Error(w, "not found", http.StatusNotFound)
	case errors.Is(err, apiservice.ErrInvalidInput):
		http.Error(w, err.Error(), http.StatusBadRequest)
	default:
		http.Error(w, "internal error", http.StatusInternalServerError)
	}
}

func toLinkResponse(link apiservice.Link) linkResponse {
	return linkResponse{
		ID:        link.ID,
		URL:       link.URL,
		Resource:  link.Resource,
		Views:     link.Views,
		ViewedAt:  link.ViewedAt,
		CreatedAt: link.CreatedAt,
		UpdatedAt: link.UpdatedAt,
	}
}

func parseIntDefault(raw string, def int) int {
	if raw == "" {
		return def
	}
	parsed, err := strconv.Atoi(raw)
	if err != nil {
		return def
	}
	return parsed
}
