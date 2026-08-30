package neon

import (
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/keywerk/internal/core/domain/dto"
	port "github.com/keywerk/internal/core/port/repository"
)

type neonProductRepository struct {
	db *sqlx.DB
}

func NewNeonProductRepository(db *sqlx.DB) port.ProductRepository {
	return &neonProductRepository{db: db}
}

func (r *neonProductRepository) Create(product dto.Product) error {

	query := `
	INSERT INTO products (
		product_id,
		category_id,
		brand_id,
		name,
		description,
		total_sold,
		created_at,
		updated_at
	) 
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
	`

	result, err := r.db.Exec(
		query,
		product.ID,
		product.CategoryID,
		product.BrandID,
		product.Name,
		product.Description,
		product.TotalSold,
		product.Created_at,
		product.Updated_at)

	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		msg := fmt.Sprintf("can't create product %s", product.Name)
		return errors.New(msg)
	}

	return nil
}

func (r *neonProductRepository) GetAll() (*[]dto.Product, error) {

	query := `
	SELECT 
		product_id,
		category_id,
		brand_id,
		name,
		description,
		total_sold,
		created_at,
		updated_at
	FROM 
		products
	`
	var listProducts []dto.Product
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}

	for rows.Next() {

		var product dto.Product

		err = rows.Scan(
			&product.ID,
			&product.CategoryID,
			&product.BrandID,
			&product.Name,
			&product.Description,
			&product.TotalSold,
			&product.Created_at,
			&product.Updated_at)

		if err != nil {
			return nil, err
		}

		listProducts = append(listProducts, product)
	}

	return &listProducts, nil
}

func (r *neonProductRepository) Get(productID string) (*dto.Product, error) {

	query := `
	SELECT
		product_id,
		category_id,
		brand_id,
		name,
		description,
		total_sold,
		created_at,
		updated_at
	FROM products WHERE product_id = $1;
	`

	var product dto.Product

	err := r.db.QueryRow(query, productID).Scan(
		&product.ID,
		&product.CategoryID,
		&product.BrandID,
		&product.Name,
		&product.Description,
		&product.TotalSold,
		&product.Created_at,
		&product.Updated_at)

	if err != nil {
		return nil, err
	}

	return &product, nil
}

func (r *neonProductRepository) Update(productID string, product dto.Product) error {

	query := `
	UPDATE products 
	SET 
		category_id = $1,
		brand_id = $2,
		name = $3,
		description = $4,
		total_sold = $5,
		updated_at = $6
	WHERE 
		product_id = $7;
	`

	result, err := r.db.Exec(
		query,
		product.CategoryID,
		product.BrandID,
		product.Name,
		product.Description,
		product.TotalSold,
		product.Updated_at,
		product.ID)

	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		msg := fmt.Sprintf("can't update %s", product.Name)
		return errors.New(msg)
	}

	return nil
}

func (r *neonProductRepository) Delete(productID string) error {

	query := `
	DELETE FROM products WHERE product_id = $1;
	`

	result, err := r.db.Exec(query, productID)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		msg := fmt.Sprintf("can't delete %s", productID)
		return errors.New(msg)
	}

	return nil

}
