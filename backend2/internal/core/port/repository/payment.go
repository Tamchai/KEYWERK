package port

import "github.com/keywerk/internal/core/domain/dto"

type PaymentRepository interface {
	Create(payment dto.Payment) error
	Retry(paymentID string, amount float64) (bool, error)
	AttachStripeSession(paymentID string, sessionID string, checkoutURL string) error
	MarkCheckoutCreationFailed(paymentID string) error
	ProcessStripeEvent(eventID, eventType, paymentID, orderID, sessionID, paymentIntentID string, status dto.PaymentStatus) error
	FindByOrderID(orderID string) (*dto.Payment, error)
	FindByID(paymentID string) (*dto.Payment, error)
	FindAll() ([]dto.Payment, error)
	VerifyAndUpdateOrder(paymentID string, orderID string, status dto.PaymentStatus) error
}
