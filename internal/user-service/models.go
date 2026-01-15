package userservice

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserModel представляет пользователя в системе
type UserModel struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	TelegramID int64     `gorm:"uniqueIndex;not null" json:"telegram_id"`
	Username   string    `gorm:"type:varchar(255)" json:"username,omitempty"`
	FirstName  string    `gorm:"type:varchar(255)" json:"first_name,omitempty"`
	LastName   string    `gorm:"type:varchar(255)" json:"last_name,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// TableName задает имя таблицы для GORM
func (UserModel) TableName() string {
	return "users"
}

// BeforeCreate хук GORM для установки UUID перед созданием
func (u *UserModel) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
