package repository

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	userservice "github.com/danilovid/linkkeeper/internal/user-service"
)

type userRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) userservice.Repository {
	return &userRepo{db: db}
}

func (r *userRepo) Create(user *userservice.UserModel) error {
	return r.db.Create(user).Error
}

func (r *userRepo) GetByID(id uuid.UUID) (*userservice.UserModel, error) {
	var user userservice.UserModel
	err := r.db.Where("id = ?", id).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) GetByTelegramID(telegramID int64) (*userservice.UserModel, error) {
	var user userservice.UserModel
	err := r.db.Where("telegram_id = ?", telegramID).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) Update(user *userservice.UserModel) error {
	return r.db.Save(user).Error
}

func (r *userRepo) Exists(telegramID int64) (bool, error) {
	var count int64
	err := r.db.Model(&userservice.UserModel{}).Where("telegram_id = ?", telegramID).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
