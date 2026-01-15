package http

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"

	userservice "github.com/danilovid/linkkeeper/internal/user-service"
	"github.com/danilovid/linkkeeper/pkg/logger"
)

type Server struct {
	uc userservice.Usecase
}

func NewServer(uc userservice.Usecase) *Server {
	return &Server{uc: uc}
}

func (s *Server) Handler() http.Handler {
	return s.routes()
}

// CreateUserRequest представляет запрос на создание пользователя
type CreateUserRequest struct {
	TelegramID int64  `json:"telegram_id"`
	Username   string `json:"username,omitempty"`
	FirstName  string `json:"first_name,omitempty"`
	LastName   string `json:"last_name,omitempty"`
}

// UserResponse представляет ответ с данными пользователя
type UserResponse struct {
	ID         string `json:"id"`
	TelegramID int64  `json:"telegram_id"`
	Username   string `json:"username,omitempty"`
	FirstName  string `json:"first_name,omitempty"`
	LastName   string `json:"last_name,omitempty"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

// ExistsResponse представляет ответ на проверку существования пользователя
type ExistsResponse struct {
	Exists bool `json:"exists"`
}

// GetOrCreateUser получает существующего пользователя или создает нового
func (s *Server) GetOrCreateUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.L().Error().Err(err).Msg("failed to decode request")
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.TelegramID == 0 {
		http.Error(w, "telegram_id is required", http.StatusBadRequest)
		return
	}

	user, err := s.uc.GetOrCreateUser(req.TelegramID, req.Username, req.FirstName, req.LastName)
	if err != nil {
		logger.L().Error().Err(err).Msg("failed to get or create user")
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	resp := UserResponse{
		ID:         user.ID.String(),
		TelegramID: user.TelegramID,
		Username:   user.Username,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		CreatedAt:  user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:  user.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

// GetUserByID возвращает пользователя по ID
func (s *Server) GetUserByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]

	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	user, err := s.uc.GetUserByID(id)
	if err != nil {
		logger.L().Error().Err(err).Msg("failed to get user")
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	resp := UserResponse{
		ID:         user.ID.String(),
		TelegramID: user.TelegramID,
		Username:   user.Username,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		CreatedAt:  user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:  user.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// GetUserByTelegramID возвращает пользователя по Telegram ID
func (s *Server) GetUserByTelegramID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	telegramID := vars["telegram_id"]

	var id int64
	if _, err := fmt.Sscanf(telegramID, "%d", &id); err != nil {
		http.Error(w, "invalid telegram_id", http.StatusBadRequest)
		return
	}

	user, err := s.uc.GetUserByTelegramID(id)
	if err != nil {
		logger.L().Error().Err(err).Msg("failed to get user by telegram id")
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	resp := UserResponse{
		ID:         user.ID.String(),
		TelegramID: user.TelegramID,
		Username:   user.Username,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		CreatedAt:  user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:  user.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// CheckUserExists проверяет, существует ли пользователь
func (s *Server) CheckUserExists(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	telegramID := vars["telegram_id"]

	var id int64
	if _, err := fmt.Sscanf(telegramID, "%d", &id); err != nil {
		http.Error(w, "invalid telegram_id", http.StatusBadRequest)
		return
	}

	exists, err := s.uc.UserExists(id)
	if err != nil {
		logger.L().Error().Err(err).Msg("failed to check user existence")
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	resp := ExistsResponse{Exists: exists}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
