package apiservice

import "context"

type LinkRepository interface {
	Create(ctx context.Context, input LinkCreateInput) (Link, error)
	GetByID(ctx context.Context, id string) (Link, error)
	List(ctx context.Context, limit, offset int) ([]Link, error)
	Random(ctx context.Context, resource string) (Link, error)
	Update(ctx context.Context, id string, input LinkUpdateInput) (Link, error)
	Delete(ctx context.Context, id string) error
	MarkViewed(ctx context.Context, id string) (Link, error)
	GetViewStats(ctx context.Context, days int) ([]ViewStats, error)
}
