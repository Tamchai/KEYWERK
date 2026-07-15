package ports

import "github.com/MaKo114/KEYWERK/core"

type BrandRepository interface {
	Save(brand core.Brand) error
	FindByID(id string) (*core.Brand, error)
	FindAll() ([]core.Brand, error)
	Update(id string, brand core.Brand) error
	Delete(id string) error
	IsBrandNameExists(name string) (bool, error)
}
