package repository

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	apiservice "github.com/danilovid/linkkeeper/internal/api-service"
)

type LinkRepo struct {
	db *gorm.DB
}

func NewLinkRepo(db *gorm.DB) *LinkRepo {
	return &LinkRepo{db: db}
}

type LinkModel struct {
	ID        string     `gorm:"type:uuid;primaryKey"`
	URL       string     `gorm:"not null"`
	Resource  string     `gorm:"not null;default:''"`
	Views     int64      `gorm:"not null;default:0"`
	ViewedAt  *time.Time `gorm:"default:null"`
	CreatedAt time.Time  `gorm:"autoCreateTime"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime"`
}

func (r *LinkRepo) Create(ctx context.Context, input apiservice.LinkCreateInput) (apiservice.Link, error) {
	model := LinkModel{
		ID:   uuid.NewString(),
		URL:  input.URL,
		Resource: input.Resource,
	}
	if err := r.db.WithContext(ctx).Create(&model).Error; err != nil {
		return apiservice.Link{}, err
	}
	return toLink(model), nil
}

func (r *LinkRepo) GetByID(ctx context.Context, id string) (apiservice.Link, error) {
	var model LinkModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return apiservice.Link{}, mapErr(err)
	}
	return toLink(model), nil
}

func (r *LinkRepo) List(ctx context.Context, limit, offset int) ([]apiservice.Link, error) {
	var models []LinkModel
	if err := r.db.WithContext(ctx).
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&models).Error; err != nil {
		return nil, err
	}
	out := make([]apiservice.Link, 0, len(models))
	for _, m := range models {
		out = append(out, toLink(m))
	}
	return out, nil
}

func (r *LinkRepo) Update(ctx context.Context, id string, input apiservice.LinkUpdateInput) (apiservice.Link, error) {
	updates := map[string]any{}
	if input.URL != nil {
		updates["url"] = *input.URL
	}
	if input.Resource != nil {
		updates["resource"] = *input.Resource
	}
	if len(updates) > 0 {
		res := r.db.WithContext(ctx).
			Model(&LinkModel{}).
			Where("id = ?", id).
			Updates(updates)
		if res.Error != nil {
			return apiservice.Link{}, res.Error
		}
		if res.RowsAffected == 0 {
			return apiservice.Link{}, apiservice.ErrNotFound
		}
	}
	return r.GetByID(ctx, id)
}

func (r *LinkRepo) Delete(ctx context.Context, id string) error {
	res := r.db.WithContext(ctx).Delete(&LinkModel{}, "id = ?", id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return apiservice.ErrNotFound
	}
	return nil
}

func (r *LinkRepo) MarkViewed(ctx context.Context, id string) (apiservice.Link, error) {
	now := time.Now()
	res := r.db.WithContext(ctx).
		Model(&LinkModel{}).
		Where("id = ?", id).
		Updates(map[string]any{
			"views":     gorm.Expr("views + 1"),
			"viewed_at": &now,
		})
	if res.Error != nil {
		return apiservice.Link{}, res.Error
	}
	if res.RowsAffected == 0 {
		return apiservice.Link{}, apiservice.ErrNotFound
	}
	return r.GetByID(ctx, id)
}

func mapErr(err error) error {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return apiservice.ErrNotFound
	}
	return err
}

func toLink(m LinkModel) apiservice.Link {
	return apiservice.Link{
		ID:        m.ID,
		URL:       m.URL,
		Resource:  m.Resource,
		Views:     m.Views,
		ViewedAt:  m.ViewedAt,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}
