package userservice

import "github.com/google/uuid"

type Repository interface {
	Create(user *UserModel) error
	GetByID(id uuid.UUID) (*UserModel, error)
	GetByTelegramID(telegramID int64) (*UserModel, error)
	Update(user *UserModel) error
	Exists(telegramID int64) (bool, error)
}
