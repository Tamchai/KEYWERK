package port

import "github.com/keywerk/internal/core/domain/dto"

type ProductRepository interface {
	Create(dto.Product) error
	GetAll() (*[]dto.Product, error)
	Get(productID string) (*dto.Product, error)
	Update(productID string, product dto.Product) error
	Delete(productID string) error
}
