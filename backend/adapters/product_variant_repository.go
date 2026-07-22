package adapters

import (
	"database/sql"
	"errors"

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

func (r *productVariantRepository) UpdateStock(tx *sqlx.Tx, variantID string, quantity int) error {
	query := `
		UPDATE productvariants 
		SET stock = stock + $1 
		WHERE variant_id = $2 AND (stock + $1) >= 0
	`

	result, err := tx.Exec(query, quantity, variantID)
	if err != nil {
		return err
	}

	// เช็กว่ามีแถวถูกอัปเดตจริงไหม
	// ถ้า rowsAffected == 0 แปลว่าไม่พบ variantID หรือ สต็อกไม่พอให้ตัด (ติดเงื่อนไข stock + $1 >= 0)
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("failed to update stock: variant not found or insufficient stock")
	}

	return nil
}
