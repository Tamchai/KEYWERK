package core

import "time"

type Payment struct {
	ID            string
	OrderID       string
	Amount        float64
	Status        PaymentStatus
	PaymentMethod string
	PaidAt        *time.Time
}

type ReqPayment struct {
	PaymentID string `json:"payment_id"`
}

type PaymentStatus string

// [pending, paid, failed]
const (
	PaymentPending PaymentStatus = "pending"
	PaymentPaid    PaymentStatus = "paid"
	PaymentFailed  PaymentStatus = "failed"
)
