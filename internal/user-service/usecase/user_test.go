package usecase

import (
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	userservice "github.com/danilovid/linkkeeper/internal/user-service"
)

type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) Create(user *userservice.UserModel) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockRepository) GetByID(id uuid.UUID) (*userservice.UserModel, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*userservice.UserModel), args.Error(1)
}

func (m *MockRepository) GetByTelegramID(telegramID int64) (*userservice.UserModel, error) {
	args := m.Called(telegramID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*userservice.UserModel), args.Error(1)
}

func (m *MockRepository) Update(user *userservice.UserModel) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockRepository) Exists(telegramID int64) (bool, error) {
	args := m.Called(telegramID)
	return args.Bool(0), args.Error(1)
}

func TestUserUsecase_CreateUser(t *testing.T) {
	mockRepo := new(MockRepository)
	uc := NewUserService(mockRepo)

	mockRepo.On("Create", mock.AnythingOfType("*userservice.UserModel")).Return(nil)

	user, err := uc.CreateUser(123456789, "testuser", "Test", "User")

	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, int64(123456789), user.TelegramID)
	assert.Equal(t, "testuser", user.Username)
	assert.Equal(t, "Test", user.FirstName)
	assert.Equal(t, "User", user.LastName)
	mockRepo.AssertExpectations(t)
}

func TestUserUsecase_CreateUser_Error(t *testing.T) {
	mockRepo := new(MockRepository)
	uc := NewUserService(mockRepo)

	mockRepo.On("Create", mock.AnythingOfType("*userservice.UserModel")).Return(errors.New("db error"))

	user, err := uc.CreateUser(123456789, "testuser", "Test", "User")

	assert.Error(t, err)
	assert.Nil(t, user)
	mockRepo.AssertExpectations(t)
}

func TestUserUsecase_GetUserByID(t *testing.T) {
	mockRepo := new(MockRepository)
	uc := NewUserService(mockRepo)

	expectedUser := &userservice.UserModel{
		ID:         uuid.New(),
		TelegramID: 123456789,
		Username:   "testuser",
	}

	mockRepo.On("GetByID", expectedUser.ID).Return(expectedUser, nil)

	user, err := uc.GetUserByID(expectedUser.ID)

	assert.NoError(t, err)
	assert.Equal(t, expectedUser, user)
	mockRepo.AssertExpectations(t)
}

func TestUserUsecase_GetUserByTelegramID(t *testing.T) {
	mockRepo := new(MockRepository)
	uc := NewUserService(mockRepo)

	expectedUser := &userservice.UserModel{
		ID:         uuid.New(),
		TelegramID: 123456789,
		Username:   "testuser",
	}

	mockRepo.On("GetByTelegramID", int64(123456789)).Return(expectedUser, nil)

	user, err := uc.GetUserByTelegramID(123456789)

	assert.NoError(t, err)
	assert.Equal(t, expectedUser, user)
	mockRepo.AssertExpectations(t)
}

func TestUserUsecase_GetOrCreateUser_Existing(t *testing.T) {
	mockRepo := new(MockRepository)
	uc := NewUserService(mockRepo)

	existingUser := &userservice.UserModel{
		ID:         uuid.New(),
		TelegramID: 123456789,
		Username:   "existinguser",
	}

	mockRepo.On("GetByTelegramID", int64(123456789)).Return(existingUser, nil)

	user, err := uc.GetOrCreateUser(123456789, "newusername", "New", "User")

	assert.NoError(t, err)
	assert.Equal(t, existingUser, user)
	assert.Equal(t, "existinguser", user.Username)
	mockRepo.AssertExpectations(t)
}

func TestUserUsecase_GetOrCreateUser_New(t *testing.T) {
	mockRepo := new(MockRepository)
	uc := NewUserService(mockRepo)

	mockRepo.On("GetByTelegramID", int64(123456789)).Return(nil, errors.New("not found"))
	mockRepo.On("Create", mock.AnythingOfType("*userservice.UserModel")).Return(nil)

	user, err := uc.GetOrCreateUser(123456789, "newuser", "New", "User")

	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, int64(123456789), user.TelegramID)
	assert.Equal(t, "newuser", user.Username)
	assert.Equal(t, "New", user.FirstName)
	mockRepo.AssertExpectations(t)
}

func TestUserUsecase_UserExists(t *testing.T) {
	mockRepo := new(MockRepository)
	uc := NewUserService(mockRepo)

	mockRepo.On("Exists", int64(123456789)).Return(true, nil)

	exists, err := uc.UserExists(123456789)

	assert.NoError(t, err)
	assert.True(t, exists)
	mockRepo.AssertExpectations(t)
}

func TestUserUsecase_UserExists_NotFound(t *testing.T) {
	mockRepo := new(MockRepository)
	uc := NewUserService(mockRepo)

	mockRepo.On("Exists", int64(999999999)).Return(false, nil)

	exists, err := uc.UserExists(999999999)

	assert.NoError(t, err)
	assert.False(t, exists)
	mockRepo.AssertExpectations(t)
}
