package dto

import "time"

type Product struct {
	ID          string
	CategoryID  string
	BrandID     string
	Name        string
	Description string
	TotalSold   int
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type ReqProduct struct {
	CategoryID  string `json:"category_id" validate:"required"`
	BrandID     string `json:"brand_id" validate:"required"`
	Name        string `json:"product_name" validate:"required"`
	Description string `json:"description"`
}

type ReqUpdateProduct struct {
	CategoryID  string `json:"category_id"`
	BrandID     string `json:"brand_id"`
	Name        string `json:"product_name"`
	Description string `json:"description"`
}

type ResProduct struct {
	ID          string `json:"product_id"`
	CategoryID  string `json:"category_id"`
	BrandID     string `json:"brand_id"`
	Name        string `json:"product_name"`
	Description string `json:"description"`
	TotalSold   int    `json:"total_sold"`
}

type ProductFilterQuery struct {
	CategoryID string `query:"category_id"`
	BrandID    string `query:"brand_id"`
	Search     string `query:"search"`
}
