package ports

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/jmoiron/sqlx"
)

type ProductVariantRepository interface {
	SaveVariant(variant *core.ProductVariant) error
	UpdateVariant(variantID string, variant *core.ProductVariant) error
	DeleteVariant(variantID string) error

	FindByVariantID(id string) (*core.ProductVariant, error)
	FindVariantByProductID(productID string) ([]core.ProductVariant, error)
	UpdateStock(Tx *sqlx.Tx, variantID string, stock int) error
}
