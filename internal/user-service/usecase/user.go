package usecase

import (
	"github.com/google/uuid"

	userservice "github.com/danilovid/linkkeeper/internal/user-service"
)

type userUsecase struct {
	repo userservice.Repository
}

func NewUserService(repo userservice.Repository) userservice.Usecase {
	return &userUsecase{repo: repo}
}

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

func (u *userUsecase) GetUserByID(id uuid.UUID) (*userservice.UserModel, error) {
	return u.repo.GetByID(id)
}

func (u *userUsecase) GetUserByTelegramID(telegramID int64) (*userservice.UserModel, error) {
	return u.repo.GetByTelegramID(telegramID)
}

func (u *userUsecase) GetOrCreateUser(telegramID int64, username, firstName, lastName string) (*userservice.UserModel, error) {
	user, err := u.repo.GetByTelegramID(telegramID)
	if err == nil {
		return user, nil
	}

	return u.CreateUser(telegramID, username, firstName, lastName)
}

func (u *userUsecase) UserExists(telegramID int64) (bool, error) {
	return u.repo.Exists(telegramID)
}
