package dto

import "time"

type PaymentStatus string

const (
	PaymentStatusPending PaymentStatus = "pending"
	PaymentStatusPaid    PaymentStatus = "paid"
	PaymentStatusFailed  PaymentStatus = "failed"
)

type Payment struct {
	ID            string
	OrderID       string
	Amount        float64
	Status        PaymentStatus
	PaymentMethod string
	PaidAt        *time.Time
}

type ReqCreatePayment struct {
	OrderID       string  `json:"order_id" validate:"required"`
	Amount        float64 `json:"amount" validate:"required,gt=0"`
	PaymentMethod string  `json:"payment_method" validate:"required"`
}

type ReqVerifyPayment struct {
	Status PaymentStatus `json:"status" validate:"required"`
}

type ResPayment struct {
	PaymentID     string        `json:"payment_id"`
	OrderID       string        `json:"order_id"`
	Amount        float64       `json:"amount"`
	Status        PaymentStatus `json:"status"`
	PaymentMethod string        `json:"payment_method"`
	PaidAt        *time.Time    `json:"paid_at,omitempty"`
}
