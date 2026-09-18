package dto

type ProductVariant struct {
	ID         string
	ProductID  string
	ImageID    string
	ImageURL   string
	Name       string
	Stock      int
	Price      float64
	SoldCount  int
	Attributes []byte
}

type ReqProductVariant struct {
	ProductID  string         `json:"product_id" validate:"required,uuid"`
	ImageID    string         `json:"image_id" validate:"omitempty,uuid"`
	Name       string         `json:"variant_name" validate:"required"`
	Stock      int            `json:"stock" validate:"gte=0"`
	Price      float64        `json:"price" validate:"required,gt=0"`
	Attributes map[string]any `json:"attributes"`
}

type ReqUpdateProductVariant struct {
	ImageID    string         `json:"image_id" validate:"omitempty,uuid"`
	Name       string         `json:"variant_name"`
	Stock      *int           `json:"stock" validate:"omitempty,gte=0"`
	Price      *float64       `json:"price" validate:"omitempty,gt=0"`
	Attributes map[string]any `json:"attributes"`
}

type ResProductVariant struct {
	ID         string         `json:"variant_id"`
	ProductID  string         `json:"product_id"`
	ImageID    string         `json:"image_id"`
	ImageURL   string         `json:"image_url"`
	Name       string         `json:"variant_name"`
	Stock      int            `json:"stock"`
	Price      float64        `json:"price"`
	SoldCount  int            `json:"sold_count"`
	Attributes map[string]any `json:"attributes"`
}
