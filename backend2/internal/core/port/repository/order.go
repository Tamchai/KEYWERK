package port

import "github.com/keywerk/internal/core/domain/dto"

type OrderRepository interface {
	Create(order dto.Order, items []dto.OrderItem) error
	FindByID(orderID string) (*dto.Order, error)
	FindItemsByOrderID(orderID string) ([]dto.ResOrderItem, error)
	FindByUserID(userID string) ([]dto.ResOrder, error)
	FindAll() ([]dto.ResOrder, error)
	UpdateStatus(orderID string, status dto.OrderStatus) error
	UpdateAddress(orderID string, req dto.ReqUpdateOrderAddress) error
	UpdateTracking(orderID string, trackingNumber string, status dto.OrderStatus) error
}
