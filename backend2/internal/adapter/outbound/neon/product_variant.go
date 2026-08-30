package neon

import (
	"errors"
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
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
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
		msg := fmt.Sprintf("can't create %s", variant.Name)
		return errors.New(msg)
	}

	return nil
}

func (r *neonProductVariantRepository) FindByID(id string) (*dto.ProductVariant, error) {

	query := `
	SELECT 
		variant_id, 
		product_id, 
		image_id, 
		name, 
		stock, 
		price, 
		sold_count, 
		attributes 
	FROM 
		productvariants WHERE variant_id = $1 ;
	`

	var variant dto.ProductVariant

	err := r.db.QueryRow(query, id).Scan(
		&variant.ID,
		&variant.ProductID,
		&variant.ImageID,
		&variant.Name,
		&variant.Stock,
		&variant.Price,
		&variant.SoldCount,
		&variant.Attributes)

	if err != nil {
		return nil, err
	}

	return &variant, nil
}

func (r *neonProductVariantRepository) Delete(id string) error {

	query := `
	DELETE FROM productvariants WHERE variant_id = $1 ;
	`
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		msg := fmt.Sprintf("can't delete variant %s", id)
		return errors.New(msg)
	}

	return nil
}

func (r *neonProductVariantRepository) Update(id string, variant dto.ProductVariant) error {
	return nil
}

func (r *neonProductVariantRepository) GetAll() (*[]dto.ProductVariant, error) {

	/* query := `
	SELECT
		variant_id,
		product_id,
		image_id,
		name,
		stock,
		price,
		sold_count,
		attributes
	FROM
		productvariants;
	`
	*/

	return nil, nil
}
