package apiservice

import "time"

type Link struct {
	ID        string
	URL       string
	Resource  string
	Views     int64
	ViewedAt  *time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}

type LinkCreateInput struct {
	URL      string
	Resource string
}

type LinkUpdateInput struct {
	URL      *string
	Resource *string
}
