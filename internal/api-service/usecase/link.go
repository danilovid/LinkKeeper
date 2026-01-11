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

func validateCreate(input apiservice.LinkCreateInput) error {
	if input.URL == "" {
		return fmt.Errorf("%w: url is required", apiservice.ErrInvalidInput)
	}
	switch input.Kind {
	case apiservice.LinkKindArticle, apiservice.LinkKindVideo:
		return nil
	default:
		return fmt.Errorf("%w: kind must be article or video", apiservice.ErrInvalidInput)
	}
}

func validateUpdate(input apiservice.LinkUpdateInput) error {
	if input.URL == nil && input.Kind == nil {
		return fmt.Errorf("%w: no fields to update", apiservice.ErrInvalidInput)
	}
	if input.URL != nil && *input.URL == "" {
		return fmt.Errorf("%w: url is required", apiservice.ErrInvalidInput)
	}
	if input.Kind != nil {
		switch *input.Kind {
		case apiservice.LinkKindArticle, apiservice.LinkKindVideo:
			return nil
		default:
			return fmt.Errorf("%w: kind must be article or video", apiservice.ErrInvalidInput)
		}
	}
	return nil
}
