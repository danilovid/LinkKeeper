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

// ViewStats представляет статистику просмотров по дням
type ViewStats struct {
	Date  string `json:"date"`  // Дата в формате YYYY-MM-DD
	Count int64  `json:"count"` // Количество просмотров в этот день
	Level int    `json:"level"` // Уровень интенсивности (0-4) для визуализации
}
