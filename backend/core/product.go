package core

import (
	"time"
)

type Product struct {
	ID          string
	CategoryID  string
	BrandID     string
	Image       string
	Name        string
	Description string
	Created_at  time.Time
	Updated_at  time.Time

	Category        Category
	Brand           Brand
	ProductVariants []Pv
}

type Pv struct {
	ID    string  `json:"variant_id"`
	Name  string  `json:"name"`
	Stock int     `json:"stock"`
	Price float64 `json:"price"`
}

type ReqProduct struct {
	Image       string `json:"image"`
	Name        string `json:"name"`
	CategoryID  string `json:"category_id"`
	BrandID     string `json:"brand_id"`
	Description string `json:"description"`
}

type ResProduct struct {
	ID          string `json:"id"`
	Image       string `json:"image"`
	Name        string `json:"name"`
	Description string `json:"description"`

	Category        Category `json:"category"`
	Brand           Brand    `json:"brand"`
	ProductVariants []Pv     `json:"product_variants"`
}
