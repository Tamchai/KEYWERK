package dto

import "time"

type PaymentStatus string

const (
	PaymentStatusPending PaymentStatus = "pending"
	PaymentStatusPaid    PaymentStatus = "paid"
	PaymentStatusFailed  PaymentStatus = "failed"
)

func (s PaymentStatus) IsValidVerification() bool {
	return s == PaymentStatusPaid || s == PaymentStatusFailed
}

type Payment struct {
	ID                      string
	OrderID                 string
	Amount                  float64
	Status                  PaymentStatus
	PaymentMethod           string
	PaidAt                  *time.Time
	ProviderSessionID       string
	ProviderPaymentIntentID string
	CheckoutURL             string
	CheckoutAttempt         int
}

type ReqCreatePayment struct {
	OrderID string `json:"order_id" validate:"required"`
}

type ReqVerifyPayment struct {
	Status PaymentStatus `json:"status" validate:"required"`
}

type ResPayment struct {
	PaymentID               string        `json:"payment_id"`
	OrderID                 string        `json:"order_id"`
	Amount                  float64       `json:"amount"`
	Status                  PaymentStatus `json:"status"`
	PaymentMethod           string        `json:"payment_method"`
	PaidAt                  *time.Time    `json:"paid_at,omitempty"`
	ProviderSessionID       string        `json:"provider_session_id,omitempty"`
	ProviderPaymentIntentID string        `json:"provider_payment_intent_id,omitempty"`
	CheckoutURL             string        `json:"checkout_url,omitempty"`
}
