package port

import "github.com/keywerk/internal/core/domain/dto"

type ProductVariantRepository interface {
	Create(dto.ProductVariant) error
	FindByID(id string) (*dto.ProductVariant, error)
	GetByProductID(productID string) ([]dto.ProductVariant, error)
	GetAll() ([]dto.ProductVariant, error)
	Update(id string, variant dto.ProductVariant) error
	Delete(id string) error
	UpdateStock(id string, quantityDelta int) error
	IncrementSold(id string, count int) error
}
