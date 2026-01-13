package usecase

import (
	"context"
	"fmt"

	apiservice "github.com/danilovid/linkkeeper/internal/api-service"
)

type LinkService struct {
	repo apiservice.LinkRepository
}

func NewLinkService(repo apiservice.LinkRepository) *LinkService {
	return &LinkService{repo: repo}
}

func (s *LinkService) Create(ctx context.Context, input apiservice.LinkCreateInput) (apiservice.Link, error) {
	if err := validateCreate(input); err != nil {
		return apiservice.Link{}, err
	}
	return s.repo.Create(ctx, input)
}

func (s *LinkService) GetByID(ctx context.Context, id string) (apiservice.Link, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *LinkService) List(ctx context.Context, limit, offset int) ([]apiservice.Link, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *LinkService) Random(ctx context.Context, resource string) (apiservice.Link, error) {
	return s.repo.Random(ctx, resource)
}

func (s *LinkService) Update(ctx context.Context, id string, input apiservice.LinkUpdateInput) (apiservice.Link, error) {
	if err := validateUpdate(input); err != nil {
		return apiservice.Link{}, err
	}
	return s.repo.Update(ctx, id, input)
}

func (s *LinkService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *LinkService) MarkViewed(ctx context.Context, id string) (apiservice.Link, error) {
	return s.repo.MarkViewed(ctx, id)
}

func (s *LinkService) GetViewStats(ctx context.Context, days int) ([]apiservice.ViewStats, error) {
	if days <= 0 {
		days = 53 // По умолчанию 53 дня
	}
	return s.repo.GetViewStats(ctx, days)
}

func validateCreate(input apiservice.LinkCreateInput) error {
	if input.URL == "" {
		return fmt.Errorf("%w: url is required", apiservice.ErrInvalidInput)
	}
	return nil
}

func validateUpdate(input apiservice.LinkUpdateInput) error {
	if input.URL == nil && input.Resource == nil {
		return fmt.Errorf("%w: no fields to update", apiservice.ErrInvalidInput)
	}
	if input.URL != nil && *input.URL == "" {
		return fmt.Errorf("%w: url is required", apiservice.ErrInvalidInput)
	}
	return nil
}
