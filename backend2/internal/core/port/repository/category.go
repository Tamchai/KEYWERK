package port

import "github.com/keywerk/internal/core/domain/dto"

type CategoryRepository interface {
	GetAll() ([]dto.Category, error)
	Get(categoryID string) (*dto.Category, error)
	Save(category dto.Category) error
	Update(categoryID string, category dto.Category) error
	Delete(categoryID string) error
}
