package usecase

import (
	"github.com/google/uuid"

	userservice "github.com/danilovid/linkkeeper/internal/user-service"
)

type userUsecase struct {
	repo userservice.Repository
}

// NewUserService создает новый сервис для работы с пользователями
func NewUserService(repo userservice.Repository) userservice.Usecase {
	return &userUsecase{repo: repo}
}

// CreateUser создает нового пользователя
func (u *userUsecase) CreateUser(telegramID int64, username, firstName, lastName string) (*userservice.UserModel, error) {
	user := &userservice.UserModel{
		TelegramID: telegramID,
		Username:   username,
		FirstName:  firstName,
		LastName:   lastName,
	}

	if err := u.repo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserByID возвращает пользователя по ID
func (u *userUsecase) GetUserByID(id uuid.UUID) (*userservice.UserModel, error) {
	return u.repo.GetByID(id)
}

// GetUserByTelegramID возвращает пользователя по Telegram ID
func (u *userUsecase) GetUserByTelegramID(telegramID int64) (*userservice.UserModel, error) {
	return u.repo.GetByTelegramID(telegramID)
}

// GetOrCreateUser получает существующего пользователя или создает нового
func (u *userUsecase) GetOrCreateUser(telegramID int64, username, firstName, lastName string) (*userservice.UserModel, error) {
	// Пытаемся найти существующего пользователя
	user, err := u.repo.GetByTelegramID(telegramID)
	if err == nil {
		return user, nil
	}

	// Если пользователь не найден, создаем нового
	return u.CreateUser(telegramID, username, firstName, lastName)
}

// UserExists проверяет, существует ли пользователь
func (u *userUsecase) UserExists(telegramID int64) (bool, error) {
	return u.repo.Exists(telegramID)
}
