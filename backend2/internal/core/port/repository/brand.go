package port

import "github.com/keywerk/internal/core/domain/dto"

type BrandRepository interface {
	GetAll() (*[]dto.Brand, error)
	Get(brandID string) (*dto.Brand, error)
	Save(dto.Brand) error
	Update(brand dto.Brand, brandID string) error
	Delete(brandID string) error
}
