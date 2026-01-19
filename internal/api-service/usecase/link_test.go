package usecase

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	apiservice "github.com/danilovid/linkkeeper/internal/api-service"
)

type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) Create(ctx context.Context, input apiservice.LinkCreateInput) (apiservice.Link, error) {
	args := m.Called(ctx, input)
	return args.Get(0).(apiservice.Link), args.Error(1)
}

func (m *MockRepository) GetByID(ctx context.Context, id string) (apiservice.Link, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(apiservice.Link), args.Error(1)
}

func (m *MockRepository) List(ctx context.Context, limit, offset int) ([]apiservice.Link, error) {
	args := m.Called(ctx, limit, offset)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]apiservice.Link), args.Error(1)
}

func (m *MockRepository) Random(ctx context.Context, resource string) (apiservice.Link, error) {
	args := m.Called(ctx, resource)
	return args.Get(0).(apiservice.Link), args.Error(1)
}

func (m *MockRepository) Update(ctx context.Context, id string, input apiservice.LinkUpdateInput) (apiservice.Link, error) {
	args := m.Called(ctx, id, input)
	return args.Get(0).(apiservice.Link), args.Error(1)
}

func (m *MockRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockRepository) MarkViewed(ctx context.Context, id string) (apiservice.Link, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(apiservice.Link), args.Error(1)
}

func (m *MockRepository) GetViewStats(ctx context.Context, days int) ([]apiservice.ViewStats, error) {
	args := m.Called(ctx, days)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]apiservice.ViewStats), args.Error(1)
}

func TestLinkService_Create(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewLinkService(mockRepo)
	ctx := context.Background()

	input := apiservice.LinkCreateInput{
		URL:      "https://example.com",
		Resource: "",
	}
	expectedLink := apiservice.Link{
		ID:        "test-id",
		URL:       "https://example.com",
		Resource:  "",
		CreatedAt: time.Now(),
	}

	mockRepo.On("Create", ctx, input).Return(expectedLink, nil)

	link, err := service.Create(ctx, input)

	assert.NoError(t, err)
	assert.Equal(t, expectedLink.URL, link.URL)
	mockRepo.AssertExpectations(t)
}

func TestLinkService_Create_WithResource(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewLinkService(mockRepo)
	ctx := context.Background()

	input := apiservice.LinkCreateInput{
		URL:      "https://example.com",
		Resource: "article",
	}
	expectedLink := apiservice.Link{
		ID:       "test-id",
		URL:      "https://example.com",
		Resource: "article",
	}

	mockRepo.On("Create", ctx, input).Return(expectedLink, nil)

	link, err := service.Create(ctx, input)

	assert.NoError(t, err)
	assert.Equal(t, expectedLink.URL, link.URL)
	assert.Equal(t, expectedLink.Resource, link.Resource)
	mockRepo.AssertExpectations(t)
}

func TestLinkService_GetByID(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewLinkService(mockRepo)
	ctx := context.Background()

	linkID := "test-id"
	expectedLink := apiservice.Link{
		ID:  linkID,
		URL: "https://example.com",
	}

	mockRepo.On("GetByID", ctx, linkID).Return(expectedLink, nil)

	link, err := service.GetByID(ctx, linkID)

	assert.NoError(t, err)
	assert.Equal(t, expectedLink, link)
	mockRepo.AssertExpectations(t)
}

func TestLinkService_List(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewLinkService(mockRepo)
	ctx := context.Background()

	expectedLinks := []apiservice.Link{
		{ID: "1", URL: "https://example1.com"},
		{ID: "2", URL: "https://example2.com"},
	}

	mockRepo.On("List", ctx, 10, 0).Return(expectedLinks, nil)

	links, err := service.List(ctx, 10, 0)

	assert.NoError(t, err)
	assert.Len(t, links, 2)
	mockRepo.AssertExpectations(t)
}

func TestLinkService_Random(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewLinkService(mockRepo)
	ctx := context.Background()

	expectedLink := apiservice.Link{
		ID:  "test-id",
		URL: "https://example.com",
	}

	mockRepo.On("Random", ctx, "").Return(expectedLink, nil)

	link, err := service.Random(ctx, "")

	assert.NoError(t, err)
	assert.Equal(t, expectedLink, link)
	mockRepo.AssertExpectations(t)
}

func TestLinkService_MarkViewed(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewLinkService(mockRepo)
	ctx := context.Background()

	linkID := "test-id"
	expectedLink := apiservice.Link{
		ID:    linkID,
		URL:   "https://example.com",
		Views: 1,
	}

	mockRepo.On("MarkViewed", ctx, linkID).Return(expectedLink, nil)

	link, err := service.MarkViewed(ctx, linkID)

	assert.NoError(t, err)
	assert.Equal(t, int64(1), link.Views)
	mockRepo.AssertExpectations(t)
}

func TestLinkService_Delete(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewLinkService(mockRepo)
	ctx := context.Background()

	linkID := "test-id"
	mockRepo.On("Delete", ctx, linkID).Return(nil)

	err := service.Delete(ctx, linkID)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestLinkService_GetViewStats(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewLinkService(mockRepo)
	ctx := context.Background()

	expectedStats := []apiservice.ViewStats{
		{Date: "2026-01-01", Count: 5, Level: 2},
		{Date: "2026-01-02", Count: 10, Level: 3},
	}

	mockRepo.On("GetViewStats", ctx, 30).Return(expectedStats, nil)

	stats, err := service.GetViewStats(ctx, 30)

	assert.NoError(t, err)
	assert.Len(t, stats, 2)
	mockRepo.AssertExpectations(t)
}

func TestLinkService_Error_Handling(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewLinkService(mockRepo)
	ctx := context.Background()

	t.Run("Create Error", func(t *testing.T) {
		input := apiservice.LinkCreateInput{URL: "https://example.com"}
		mockRepo.On("Create", ctx, input).Return(apiservice.Link{}, errors.New("db error")).Once()

		_, err := service.Create(ctx, input)

		assert.Error(t, err)
	})

	t.Run("GetByID Error", func(t *testing.T) {
		mockRepo.On("GetByID", ctx, "invalid-id").Return(apiservice.Link{}, errors.New("not found")).Once()

		_, err := service.GetByID(ctx, "invalid-id")

		assert.Error(t, err)
	})

	t.Run("List Error", func(t *testing.T) {
		mockRepo.On("List", ctx, 10, 0).Return(nil, errors.New("db error")).Once()

		_, err := service.List(ctx, 10, 0)

		assert.Error(t, err)
	})

	t.Run("Random Error", func(t *testing.T) {
		mockRepo.On("Random", ctx, "").Return(apiservice.Link{}, errors.New("not found")).Once()

		_, err := service.Random(ctx, "")

		assert.Error(t, err)
	})
}
