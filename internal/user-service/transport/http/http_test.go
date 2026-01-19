package http

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	userservice "github.com/danilovid/linkkeeper/internal/user-service"
)

type MockUsecase struct {
	mock.Mock
}

func (m *MockUsecase) CreateUser(telegramID int64, username, firstName, lastName string) (*userservice.UserModel, error) {
	args := m.Called(telegramID, username, firstName, lastName)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*userservice.UserModel), args.Error(1)
}

func (m *MockUsecase) GetUserByID(id uuid.UUID) (*userservice.UserModel, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*userservice.UserModel), args.Error(1)
}

func (m *MockUsecase) GetUserByTelegramID(telegramID int64) (*userservice.UserModel, error) {
	args := m.Called(telegramID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*userservice.UserModel), args.Error(1)
}

func (m *MockUsecase) GetOrCreateUser(telegramID int64, username, firstName, lastName string) (*userservice.UserModel, error) {
	args := m.Called(telegramID, username, firstName, lastName)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*userservice.UserModel), args.Error(1)
}

func (m *MockUsecase) UserExists(telegramID int64) (bool, error) {
	args := m.Called(telegramID)
	return args.Bool(0), args.Error(1)
}

func TestGetOrCreateUser_Success(t *testing.T) {
	mockUC := new(MockUsecase)
	server := NewServer(mockUC)

	expectedUser := &userservice.UserModel{
		ID:         uuid.New(),
		TelegramID: 123456789,
		Username:   "testuser",
		FirstName:  "Test",
		LastName:   "User",
	}

	mockUC.On("GetOrCreateUser", int64(123456789), "testuser", "Test", "User").Return(expectedUser, nil)

	reqBody := CreateUserRequest{
		TelegramID: 123456789,
		Username:   "testuser",
		FirstName:  "Test",
		LastName:   "User",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/api/v1/users", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	server.GetOrCreateUser(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp UserResponse
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, expectedUser.ID.String(), resp.ID)
	assert.Equal(t, expectedUser.TelegramID, resp.TelegramID)
	assert.Equal(t, expectedUser.Username, resp.Username)
	mockUC.AssertExpectations(t)
}

func TestGetOrCreateUser_InvalidJSON(t *testing.T) {
	mockUC := new(MockUsecase)
	server := NewServer(mockUC)

	req := httptest.NewRequest("POST", "/api/v1/users", bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	server.GetOrCreateUser(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGetOrCreateUser_MissingTelegramID(t *testing.T) {
	mockUC := new(MockUsecase)
	server := NewServer(mockUC)

	reqBody := CreateUserRequest{
		Username: "testuser",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/api/v1/users", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	server.GetOrCreateUser(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGetUserByID_Success(t *testing.T) {
	mockUC := new(MockUsecase)
	server := NewServer(mockUC)

	userID := uuid.New()
	expectedUser := &userservice.UserModel{
		ID:         userID,
		TelegramID: 123456789,
		Username:   "testuser",
	}

	mockUC.On("GetUserByID", userID).Return(expectedUser, nil)

	req := httptest.NewRequest("GET", "/api/v1/users/"+userID.String(), nil)
	req = mux.SetURLVars(req, map[string]string{"id": userID.String()})
	w := httptest.NewRecorder()

	server.GetUserByID(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp UserResponse
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, userID.String(), resp.ID)
	mockUC.AssertExpectations(t)
}

func TestGetUserByID_InvalidUUID(t *testing.T) {
	mockUC := new(MockUsecase)
	server := NewServer(mockUC)

	req := httptest.NewRequest("GET", "/api/v1/users/invalid-uuid", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "invalid-uuid"})
	w := httptest.NewRecorder()

	server.GetUserByID(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGetUserByID_NotFound(t *testing.T) {
	mockUC := new(MockUsecase)
	server := NewServer(mockUC)

	userID := uuid.New()
	mockUC.On("GetUserByID", userID).Return(nil, errors.New("user not found"))

	req := httptest.NewRequest("GET", "/api/v1/users/"+userID.String(), nil)
	req = mux.SetURLVars(req, map[string]string{"id": userID.String()})
	w := httptest.NewRecorder()

	server.GetUserByID(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	mockUC.AssertExpectations(t)
}

func TestCheckUserExists_True(t *testing.T) {
	mockUC := new(MockUsecase)
	server := NewServer(mockUC)

	mockUC.On("UserExists", int64(123456789)).Return(true, nil)

	req := httptest.NewRequest("GET", "/api/v1/users/telegram/123456789/exists", nil)
	req = mux.SetURLVars(req, map[string]string{"telegram_id": "123456789"})
	w := httptest.NewRecorder()

	server.CheckUserExists(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp ExistsResponse
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.True(t, resp.Exists)
	mockUC.AssertExpectations(t)
}

func TestCheckUserExists_False(t *testing.T) {
	mockUC := new(MockUsecase)
	server := NewServer(mockUC)

	mockUC.On("UserExists", int64(999999999)).Return(false, nil)

	req := httptest.NewRequest("GET", "/api/v1/users/telegram/999999999/exists", nil)
	req = mux.SetURLVars(req, map[string]string{"telegram_id": "999999999"})
	w := httptest.NewRecorder()

	server.CheckUserExists(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp ExistsResponse
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.False(t, resp.Exists)
	mockUC.AssertExpectations(t)
}
