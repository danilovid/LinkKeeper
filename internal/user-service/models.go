package userservice

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserModel struct {
	ID         uuid.UUID `gorm:"type:char(36);primary_key" json:"id"`
	TelegramID int64     `gorm:"uniqueIndex;not null" json:"telegram_id"`
	Username   string    `gorm:"type:varchar(255)" json:"username,omitempty"`
	FirstName  string    `gorm:"type:varchar(255)" json:"first_name,omitempty"`
	LastName   string    `gorm:"type:varchar(255)" json:"last_name,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (UserModel) TableName() string {
	return "users"
}

func (u *UserModel) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
