package dto

import "time"

type Product struct {
	ID          string
	CategoryID  string
	BrandID     string
	Name        string
	Description string
	TotalSold   int
	Created_at  time.Time
	Updated_at  time.Time
}

type ReqProduct struct {
	CategoryID  string `json:"category_id"`
	BrandID     string `json:"brand_id"`
	Name        string `json:"product_name"`
	Description string `json:"description"`
}

type ReqUpdateProduct struct {
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
