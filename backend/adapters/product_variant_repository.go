package adapters

import (
	"database/sql"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/jmoiron/sqlx"
)

type productVariantRepository struct {
	db *sqlx.DB
}

func NewProductVariantRepository(db *sqlx.DB) ports.ProductVariantRepository {
	return &productVariantRepository{db: db}
}

func (r *productVariantRepository) SaveVariant(variant *core.ProductVariant) error {
	query := `
    INSERT INTO productvariants (variant_id, name, stock, price, product_id)
    VALUES ($1, $2, $3, $4, $5)
    `
	_, err := r.db.Exec(query, variant.ID, variant.Name, variant.Stock, variant.Price, variant.ProductID)
	if err != nil {
		return err
	}
	return nil
}

func (r *productVariantRepository) UpdateVariant(variantID string, variant *core.ProductVariant) error {
	return nil
}
func (r *productVariantRepository) DeleteVariant(variantID string) error {
	return nil
}

func (r *productVariantRepository) FindByVariantID(id string) (*core.ProductVariant, error) {
	query := `
    SELECT 
        pv.variant_id, pv.name, pv.stock, pv.price, pv.product_id,
        p.product_id, p.name, p.image, p.description
    FROM 
		productvariants AS pv
    INNER JOIN 
		products AS p ON pv.product_id = p.product_id
    WHERE 
		pv.variant_id = $1
    `

	var variant core.ProductVariant
	var product core.Product

	err := r.db.QueryRow(query, id).Scan(
		&variant.ID, &variant.Name, &variant.Stock, &variant.Price, &variant.ProductID,
		&product.ID, &product.Name, &product.Image, &product.Description,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	variant.Product = product

	return &variant, nil
}

func (r *productVariantRepository) FindVariantByProductID(productID string) ([]core.ProductVariant, error) {
	query := `
    SELECT 
		variant_id, name, stock, price, product_id
    FROM 
		productvariants
    WHERE 
		product_id = $1
    `

	rows, err := r.db.Query(query, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var variants []core.ProductVariant

	for rows.Next() {
		var v core.ProductVariant
		err := rows.Scan(&v.ID, &v.Name, &v.Stock, &v.Price, &v.ProductID)
		if err != nil {
			return nil, err
		}

		variants = append(variants, v)
	}

	if variants == nil {
		variants = []core.ProductVariant{}
	}

	return variants, nil
}
