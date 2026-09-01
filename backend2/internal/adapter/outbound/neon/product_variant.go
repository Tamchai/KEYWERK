package neon

import (
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/keywerk/internal/core/domain/dto"
	port "github.com/keywerk/internal/core/port/repository"
)

type neonProductVariantRepository struct {
	db *sqlx.DB
}

func NewNeonProductVariantRepository(db *sqlx.DB) port.ProductVariantRepository {
	return &neonProductVariantRepository{db}
}

func (r *neonProductVariantRepository) Create(variant dto.ProductVariant) error {
	query := `
    INSERT INTO productvariants (variant_id, product_id, image_id, name, stock, price, sold_count, attributes)
    VALUES ($1, $2, CASE WHEN $3::text != '' THEN $3::uuid ELSE NULL END, $4, $5, $6, $7, $8);
    `
	result, err := r.db.Exec(
		query,
		variant.ID,
		variant.ProductID,
		variant.ImageID,
		variant.Name,
		variant.Stock,
		variant.Price,
		variant.SoldCount,
		variant.Attributes,
	)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("cannot create variant %s", variant.Name)
	}

	return nil
}

func (r *neonProductVariantRepository) FindByID(id string) (*dto.ProductVariant, error) {
	query := `
	SELECT 
		pv.variant_id::text, 
		pv.product_id::text, 
		COALESCE(pv.image_id::text, ''), 
		COALESCE(img.image_url, ''),
		pv.name, 
		pv.stock, 
		pv.price::text, 
		pv.sold_count, 
		COALESCE(pv.attributes, '{}'::jsonb) 
	FROM productvariants pv
	LEFT JOIN images img ON pv.image_id = img.image_id
	WHERE pv.variant_id = $1;
	`

	var variant dto.ProductVariant
	var priceStr string
	err := r.db.QueryRow(query, id).Scan(
		&variant.ID,
		&variant.ProductID,
		&variant.ImageID,
		&variant.ImageURL,
		&variant.Name,
		&variant.Stock,
		&priceStr,
		&variant.SoldCount,
		&variant.Attributes)

	if err != nil {
		return nil, err
	}

	if priceStr != "" {
		fmt.Sscanf(priceStr, "%f", &variant.Price)
	}

	return &variant, nil
}

func (r *neonProductVariantRepository) GetByProductID(productID string) ([]dto.ProductVariant, error) {
	query := `
	SELECT 
		pv.variant_id::text, 
		pv.product_id::text, 
		COALESCE(pv.image_id::text, ''), 
		COALESCE(img.image_url, ''),
		pv.name, 
		pv.stock, 
		pv.price::text, 
		pv.sold_count, 
		COALESCE(pv.attributes, '{}'::jsonb) 
	FROM productvariants pv
	LEFT JOIN images img ON pv.image_id = img.image_id
	WHERE pv.product_id = $1
	ORDER BY pv.name ASC;
	`

	rows, err := r.db.Query(query, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var variants []dto.ProductVariant
	for rows.Next() {
		var v dto.ProductVariant
		var priceStr string
		err = rows.Scan(
			&v.ID,
			&v.ProductID,
			&v.ImageID,
			&v.ImageURL,
			&v.Name,
			&v.Stock,
			&priceStr,
			&v.SoldCount,
			&v.Attributes,
		)
		if err != nil {
			return nil, err
		}
		if priceStr != "" {
			fmt.Sscanf(priceStr, "%f", &v.Price)
		}
		variants = append(variants, v)
	}

	return variants, nil
}

func (r *neonProductVariantRepository) GetAll() ([]dto.ProductVariant, error) {
	query := `
	SELECT 
		pv.variant_id::text, 
		pv.product_id::text, 
		COALESCE(pv.image_id::text, ''), 
		COALESCE(img.image_url, ''),
		pv.name, 
		pv.stock, 
		pv.price::text, 
		pv.sold_count, 
		COALESCE(pv.attributes, '{}'::jsonb) 
	FROM productvariants pv
	LEFT JOIN images img ON pv.image_id = img.image_id
	ORDER BY pv.name ASC;
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var variants []dto.ProductVariant
	for rows.Next() {
		var v dto.ProductVariant
		var priceStr string
		err = rows.Scan(
			&v.ID,
			&v.ProductID,
			&v.ImageID,
			&v.ImageURL,
			&v.Name,
			&v.Stock,
			&priceStr,
			&v.SoldCount,
			&v.Attributes,
		)
		if err != nil {
			return nil, err
		}
		if priceStr != "" {
			fmt.Sscanf(priceStr, "%f", &v.Price)
		}
		variants = append(variants, v)
	}

	return variants, nil
}

func (r *neonProductVariantRepository) Update(id string, variant dto.ProductVariant) error {
	query := `
	UPDATE productvariants
	SET
		name = $1,
		stock = $2,
		price = $3,
		image_id = CASE WHEN $4::text != '' THEN $4::uuid ELSE NULL END,
		attributes = $5
	WHERE variant_id = $6;
	`

	result, err := r.db.Exec(
		query,
		variant.Name,
		variant.Stock,
		variant.Price,
		variant.ImageID,
		variant.Attributes,
		id,
	)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("cannot update variant %s", id)
	}

	return nil
}

func (r *neonProductVariantRepository) Delete(id string) error {
	query := `DELETE FROM productvariants WHERE variant_id = $1;`
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("cannot delete variant %s", id)
	}

	return nil
}

func (r *neonProductVariantRepository) UpdateStock(id string, quantityDelta int) error {
	query := `UPDATE productvariants SET stock = stock + $1 WHERE variant_id = $2 AND stock + $1 >= 0;`
	result, err := r.db.Exec(query, quantityDelta, id)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("insufficient stock for variant %s", id)
	}

	return nil
}

func (r *neonProductVariantRepository) IncrementSold(id string, count int) error {
	query := `UPDATE productvariants SET sold_count = COALESCE(sold_count, 0) + $1 WHERE variant_id = $2;`
	_, err := r.db.Exec(query, count, id)
	return err
}
