package ports

import "github.com/MaKo114/KEYWERK/core"

type ProductRepository interface {
	Save(product core.Product) error
	GetAll() ([]core.Product, error)
	Update(productID string, product core.Product) error
	Delete(productID string) error

	FindByID(productID string) (*core.Product, error)
}
