package port

import "github.com/keywerk/internal/core/domain/dto"

type PaymentRepository interface {
	Create(payment dto.Payment) error
	FindByOrderID(orderID string) (*dto.Payment, error)
	FindByID(paymentID string) (*dto.Payment, error)
	FindAll() ([]dto.Payment, error)
	UpdateStatus(paymentID string, status dto.PaymentStatus) error
}
