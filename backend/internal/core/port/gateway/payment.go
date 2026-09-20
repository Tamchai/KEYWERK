package gateway

import "context"

type CheckoutRequest struct {
	PaymentID  string
	OrderID    string
	Amount     int64
	Currency   string
	Name       string
	SuccessURL string
	CancelURL  string
	Attempt    int
}

type CheckoutSession struct {
	ID  string
	URL string
}

type CheckoutSessionStatus struct {
	ID              string
	PaymentID       string
	OrderID         string
	PaymentStatus   string
	SessionStatus   string
	PaymentIntentID string
}

type WebhookEvent struct {
	ID              string
	Type            string
	PaymentID       string
	OrderID         string
	SessionID       string
	PaymentIntentID string
	PaymentStatus   string
}

type PaymentGateway interface {
	CreateCheckoutSession(ctx context.Context, req CheckoutRequest) (*CheckoutSession, error)
	GetCheckoutSession(ctx context.Context, sessionID string) (*CheckoutSessionStatus, error)
	ParseWebhook(payload []byte, signature string) (*WebhookEvent, error)
}
