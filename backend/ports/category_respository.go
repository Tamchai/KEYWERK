package ports

import "github.com/MaKo114/KEYWERK/core"

type CategoryRepository interface {
	Get() ([]core.Category, error)
	Update(categoryID string, category core.Category) error
	Delete(categoryID string) error
	Save(category core.Category) error
}
