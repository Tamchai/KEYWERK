package dto

import "time"

type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusProcessing OrderStatus = "processing"
	OrderStatusShipped    OrderStatus = "shipped"
	OrderStatusCancelled  OrderStatus = "cancelled"
)

type Order struct {
	ID             string
	UserID         string
	Status         OrderStatus
	TotalPrice     float64
	ShippingMethod string
	TrackingNumber string
	ReceiverName   string
	PhoneNumber    string
	AddressLine1   string
	AddressLine2   string
	District       string
	Province       string
	PostalCode     string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type OrderItem struct {
	ID        string
	OrderID   string
	VariantID string
	UnitPrice float64
	Quantity  int
}

type ReqOrderItem struct {
	VariantID string `json:"variant_id" validate:"required"`
	Quantity  int    `json:"quantity" validate:"required,min=1"`
}

type ReqCreateOrder struct {
	AddressID      string         `json:"address_id"`
	ReceiverName   string         `json:"receiver_name"`
	PhoneNumber    string         `json:"phone_number"`
	AddressLine1   string         `json:"address_line1"`
	AddressLine2   string         `json:"address_line2"`
	District       string         `json:"district"`
	Province       string         `json:"province"`
	PostalCode     string         `json:"postal_code"`
	ShippingMethod string         `json:"shipping_method"`
	Items          []ReqOrderItem `json:"items"` // If empty, checkout from Cart
}

type ReqUpdateOrderAddress struct {
	ReceiverName string `json:"receiver_name" validate:"required"`
	PhoneNumber  string `json:"phone_number" validate:"required"`
	AddressLine1 string `json:"address_line1" validate:"required"`
	AddressLine2 string `json:"address_line2"`
	District     string `json:"district" validate:"required"`
	Province     string `json:"province" validate:"required"`
	PostalCode   string `json:"postal_code" validate:"required"`
}

type ReqUpdateOrderStatus struct {
	Status OrderStatus `json:"status" validate:"required"`
}

type ReqUpdateTracking struct {
	TrackingNumber string      `json:"tracking_number" validate:"required"`
	Status         OrderStatus `json:"status"`
}

type ResOrderItem struct {
	OrderItemID string  `json:"orderitem_id"`
	VariantID   string  `json:"variant_id"`
	VariantName string  `json:"variant_name"`
	ProductID   string  `json:"product_id"`
	ProductName string  `json:"product_name"`
	ImageURL    string  `json:"image_url"`
	UnitPrice   float64 `json:"unit_price"`
	Quantity    int     `json:"quantity"`
	Subtotal    float64 `json:"subtotal"`
}

type ResOrder struct {
	OrderID        string      `json:"order_id"`
	UserID         string      `json:"user_id"`
	Status         OrderStatus `json:"status"`
	TotalPrice     float64     `json:"total_price"`
	ShippingMethod string      `json:"shipping_method"`
	TrackingNumber string      `json:"tracking_number"`
	ReceiverName   string      `json:"receiver_name"`
	PhoneNumber    string      `json:"phone_number"`
	AddressLine1   string      `json:"address_line1"`
	AddressLine2   string      `json:"address_line2"`
	District       string      `json:"district"`
	Province       string      `json:"province"`
	PostalCode     string      `json:"postal_code"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`
}

type ResOrderDetail struct {
	ResOrder
	Items   []ResOrderItem `json:"items"`
	Payment *ResPayment    `json:"payment,omitempty"`
}
