package core

import "time"

type Cart struct {
	CartID    string
	UserID    string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type CartItem struct {
	CartItemID string
	CartID     string
	VariantID  string
	Quantity   int
}

type ReqCartItem struct {
	VariantID string `json:"variant_id"`
	Quantity  int    `json:"quantity"`
}
type ReqDeleteCartItem struct {
	CartID    string `json:"cart_id"`
	VariantID string `json:"variant_id"`
}

type ResCartItem struct {
	VariantID string `json:"variant_id"`
	Quantity  int    `json:"quantity"`
}
