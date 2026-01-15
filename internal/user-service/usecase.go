package userservice

import "github.com/google/uuid"

// Usecase определяет бизнес-логику для работы с пользователями
type Usecase interface {
	CreateUser(telegramID int64, username, firstName, lastName string) (*UserModel, error)
	GetUserByID(id uuid.UUID) (*UserModel, error)
	GetUserByTelegramID(telegramID int64) (*UserModel, error)
	GetOrCreateUser(telegramID int64, username, firstName, lastName string) (*UserModel, error)
	UserExists(telegramID int64) (bool, error)
}
