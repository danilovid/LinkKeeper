package apiservice

import "time"

type LinkKind string

const (
	LinkKindArticle LinkKind = "article"
	LinkKindVideo   LinkKind = "video"
)

type Link struct {
	ID        string
	URL       string
	Kind      LinkKind
	Views     int64
	ViewedAt  *time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}

type LinkCreateInput struct {
	URL  string
	Kind LinkKind
}

type LinkUpdateInput struct {
	URL  *string
	Kind *LinkKind
}
