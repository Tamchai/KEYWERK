package port

import "github.com/keywerk/internal/core/domain/dto"

type ProductVariantRepository interface {
	Create(dto.ProductVariant) error
	FindByID(id string) (*dto.ProductVariant, error)
	GetAll() (*[]dto.ProductVariant, error)
	Delete(id string) error
	Update(id string, variant dto.ProductVariant) error
}
