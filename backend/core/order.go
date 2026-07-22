package core

import "time"

type Order struct {
	OrderID        string
	UserID         string
	Status         OrderStatus
	TotalPrice     float64
	ReceiverName   string
	PhoneNumber    string
	AddressLine1   string
	AddressLine2   string
	District       string
	Province       string
	PostalCode     string
	ShippingMethod string
	TrackingNumber string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type ReqOrder struct {
	TotalPrice     float64
	ReceiverName   string
	PhoneNumber    string
	AddressLine1   string
	AddressLine2   string
	District       string
	Province       string
	PostalCode     string
	ShippingMethod string
	TrackingNumber string
}

type OrderItem struct {
	OrderitemID string
	OrderID     string
	VariantID   string
	UnitPrice   float64
	Quantity    int
}

type CheckoutRequest struct {
	AddressID      string `json:"address_id"`
	ShippingMethod string `json:"shipping_method"`
}

type OrderStatus string

const (
	OrderPending    OrderStatus = "pending"
	OrderProcessing OrderStatus = "processing"
	OrderShipped    OrderStatus = "shipped"
	OrderCancelled  OrderStatus = "cancelled"
	OrderCompleted  OrderStatus = "completed"
)
