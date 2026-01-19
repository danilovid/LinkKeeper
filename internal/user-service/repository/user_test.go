package repository

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	userservice "github.com/danilovid/linkkeeper/internal/user-service"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)

	err = db.AutoMigrate(&userservice.UserModel{})
	require.NoError(t, err)

	return db
}

func TestUserRepo_Create(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepo(db)

	user := &userservice.UserModel{
		TelegramID: 123456789,
		Username:   "testuser",
		FirstName:  "Test",
		LastName:   "User",
	}

	err := repo.Create(user)
	assert.NoError(t, err)
	assert.NotEqual(t, uuid.Nil, user.ID)
	assert.NotZero(t, user.CreatedAt)
	assert.NotZero(t, user.UpdatedAt)
}

func TestUserRepo_Create_DuplicateTelegramID(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepo(db)

	user1 := &userservice.UserModel{
		TelegramID: 123456789,
		Username:   "user1",
	}
	err := repo.Create(user1)
	require.NoError(t, err)

	user2 := &userservice.UserModel{
		TelegramID: 123456789,
		Username:   "user2",
	}
	err = repo.Create(user2)
	assert.Error(t, err)
}

func TestUserRepo_GetByID(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepo(db)

	user := &userservice.UserModel{
		TelegramID: 123456789,
		Username:   "testuser",
	}
	err := repo.Create(user)
	require.NoError(t, err)

	found, err := repo.GetByID(user.ID)
	assert.NoError(t, err)
	assert.Equal(t, user.ID, found.ID)
	assert.Equal(t, user.TelegramID, found.TelegramID)
	assert.Equal(t, user.Username, found.Username)
}

func TestUserRepo_GetByID_NotFound(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepo(db)

	_, err := repo.GetByID(uuid.New())
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "not found")
}

func TestUserRepo_GetByTelegramID(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepo(db)

	user := &userservice.UserModel{
		TelegramID: 123456789,
		Username:   "testuser",
		FirstName:  "Test",
	}
	err := repo.Create(user)
	require.NoError(t, err)

	found, err := repo.GetByTelegramID(123456789)
	assert.NoError(t, err)
	assert.Equal(t, user.ID, found.ID)
	assert.Equal(t, user.TelegramID, found.TelegramID)
	assert.Equal(t, user.Username, found.Username)
	assert.Equal(t, user.FirstName, found.FirstName)
}

func TestUserRepo_GetByTelegramID_NotFound(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepo(db)

	_, err := repo.GetByTelegramID(999999999)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "not found")
}

func TestUserRepo_Update(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepo(db)

	user := &userservice.UserModel{
		TelegramID: 123456789,
		Username:   "oldusername",
		FirstName:  "Old",
	}
	err := repo.Create(user)
	require.NoError(t, err)

	user.Username = "newusername"
	user.FirstName = "New"

	err = repo.Update(user)
	assert.NoError(t, err)

	found, err := repo.GetByID(user.ID)
	require.NoError(t, err)
	assert.Equal(t, "newusername", found.Username)
	assert.Equal(t, "New", found.FirstName)
}

func TestUserRepo_Exists(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepo(db)

	exists, err := repo.Exists(123456789)
	require.NoError(t, err)
	assert.False(t, exists)

	user := &userservice.UserModel{
		TelegramID: 123456789,
		Username:   "testuser",
	}
	err = repo.Create(user)
	require.NoError(t, err)

	exists, err = repo.Exists(123456789)
	require.NoError(t, err)
	assert.True(t, exists)
}
