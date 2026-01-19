package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	userservice "github.com/danilovid/linkkeeper/internal/user-service"
	userrepo "github.com/danilovid/linkkeeper/internal/user-service/repository"
	userhttp "github.com/danilovid/linkkeeper/internal/user-service/transport/http"
	userusecase "github.com/danilovid/linkkeeper/internal/user-service/usecase"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)

	err = db.AutoMigrate(&userservice.UserModel{})
	require.NoError(t, err)

	return db
}

func setupUserService(t *testing.T) (*userhttp.Server, *gorm.DB) {
	db := setupTestDB(t)

	userRepo := userrepo.NewUserRepo(db)
	userUC := userusecase.NewUserService(userRepo)
	userServer := userhttp.NewServer(userUC)

	return userServer, db
}

func TestIntegration_CreateAndGetUser(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	userServer, _ := setupUserService(t)

	reqBody := map[string]interface{}{
		"telegram_id": 123456789,
		"username":    "testuser",
		"first_name":  "Test",
		"last_name":   "User",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/api/v1/users", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	userServer.GetOrCreateUser(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var userResp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &userResp)
	require.NoError(t, err)
	assert.Equal(t, float64(123456789), userResp["telegram_id"])

	req2 := httptest.NewRequest("POST", "/api/v1/users", bytes.NewBuffer(body))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()

	userServer.GetOrCreateUser(w2, req2)

	assert.Equal(t, http.StatusOK, w2.Code)

	var userResp2 map[string]interface{}
	err = json.Unmarshal(w2.Body.Bytes(), &userResp2)
	require.NoError(t, err)
	assert.Equal(t, userResp["id"], userResp2["id"])
}

func TestIntegration_UserExists(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	_, db := setupUserService(t)
	ctx := context.Background()

	user := &userservice.UserModel{
		TelegramID: 987654321,
		Username:   "existinguser",
	}
	err := db.WithContext(ctx).Create(user).Error
	require.NoError(t, err)

	var count int64
	err = db.WithContext(ctx).Model(&userservice.UserModel{}).
		Where("telegram_id = ?", 987654321).
		Count(&count).Error
	require.NoError(t, err)
	assert.Equal(t, int64(1), count)

	err = db.WithContext(ctx).Model(&userservice.UserModel{}).
		Where("telegram_id = ?", 999999999).
		Count(&count).Error
	require.NoError(t, err)
	assert.Equal(t, int64(0), count)
}

func TestIntegration_MultipleUsers(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	_, db := setupUserService(t)
	ctx := context.Background()

	users := []userservice.UserModel{
		{TelegramID: 111111111, Username: "user1"},
		{TelegramID: 222222222, Username: "user2"},
		{TelegramID: 333333333, Username: "user3"},
	}

	for _, user := range users {
		u := user
		err := db.WithContext(ctx).Create(&u).Error
		require.NoError(t, err)
	}

	var count int64
	err := db.WithContext(ctx).Model(&userservice.UserModel{}).Count(&count).Error
	require.NoError(t, err)
	assert.Equal(t, int64(3), count)
}

func TestMain(m *testing.M) {
	code := m.Run()
	os.Exit(code)
}
