package dto

import "time"

type Cart struct {
	ID        string
	UserID    string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type CartItem struct {
	ID        string
	CartID    string
	VariantID string
	Quantity  int
}

type ReqAddToCart struct {
	VariantID string `json:"variant_id" validate:"required"`
	Quantity  int    `json:"quantity" validate:"required,min=1"`
}

type ReqUpdateCartItem struct {
	Quantity int `json:"quantity" validate:"required,min=1"`
}

type ResCartItem struct {
	CartItemID  string  `json:"cartitem_id"`
	VariantID   string  `json:"variant_id"`
	VariantName string  `json:"variant_name"`
	ProductID   string  `json:"product_id"`
	ProductName string  `json:"product_name"`
	ImageURL    string  `json:"image_url"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Stock       int     `json:"stock"`
	Subtotal    float64 `json:"subtotal"`
}

type ResCart struct {
	CartID     string        `json:"cart_id"`
	UserID     string        `json:"user_id"`
	Items      []ResCartItem `json:"items"`
	TotalItems int           `json:"total_items"`
	TotalPrice float64       `json:"total_price"`
}
