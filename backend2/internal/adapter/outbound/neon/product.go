package neon

import (
	"fmt"
	"strings"

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

	var categoryID, brandID any
	if product.CategoryID != "" {
		categoryID = product.CategoryID
	} else {
		categoryID = nil
	}
	if product.BrandID != "" {
		brandID = product.BrandID
	} else {
		brandID = nil
	}

	result, err := r.db.Exec(
		query,
		product.ID,
		categoryID,
		brandID,
		product.Name,
		product.Description,
		product.TotalSold,
		product.CreatedAt,
		product.UpdatedAt)

	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("cannot create product %s", product.Name)
	}

	return nil
}

func (r *neonProductRepository) GetAll(filter dto.ProductFilterQuery) ([]dto.Product, error) {
	queryBuilder := strings.Builder{}
	queryBuilder.WriteString(`
	SELECT 
		product_id,
		COALESCE(category_id::text, ''),
		COALESCE(brand_id::text, ''),
		name,
		COALESCE(description, ''),
		COALESCE(total_sold, 0),
		created_at,
		updated_at
	FROM products
	WHERE 1=1
	`)

	var args []any
	argIdx := 1

	if filter.CategoryID != "" {
		queryBuilder.WriteString(fmt.Sprintf(" AND category_id = $%d", argIdx))
		args = append(args, filter.CategoryID)
		argIdx++
	}

	if filter.BrandID != "" {
		queryBuilder.WriteString(fmt.Sprintf(" AND brand_id = $%d", argIdx))
		args = append(args, filter.BrandID)
		argIdx++
	}

	if filter.Search != "" {
		queryBuilder.WriteString(fmt.Sprintf(" AND (name ILIKE $%d OR description ILIKE $%d)", argIdx, argIdx))
		args = append(args, "%"+filter.Search+"%")
		argIdx++
	}

	queryBuilder.WriteString(" ORDER BY created_at DESC")

	rows, err := r.db.Query(queryBuilder.String(), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var listProducts []dto.Product
	for rows.Next() {
		var product dto.Product
		err = rows.Scan(
			&product.ID,
			&product.CategoryID,
			&product.BrandID,
			&product.Name,
			&product.Description,
			&product.TotalSold,
			&product.CreatedAt,
			&product.UpdatedAt)

		if err != nil {
			return nil, err
		}

		listProducts = append(listProducts, product)
	}

	return listProducts, nil
}

func (r *neonProductRepository) Get(productID string) (*dto.Product, error) {
	query := `
	SELECT
		product_id,
		COALESCE(category_id::text, ''),
		COALESCE(brand_id::text, ''),
		name,
		COALESCE(description, ''),
		COALESCE(total_sold, 0),
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
		&product.CreatedAt,
		&product.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &product, nil
}

func (r *neonProductRepository) Update(productID string, product dto.Product) error {
	query := `
	UPDATE products 
	SET 
		category_id = CASE WHEN $1::text != '' THEN $1::uuid ELSE category_id END,
		brand_id = CASE WHEN $2::text != '' THEN $2::uuid ELSE brand_id END,
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
		product.UpdatedAt,
		productID)

	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("cannot update %s", product.Name)
	}

	return nil
}

func (r *neonProductRepository) Delete(productID string) error {
	query := `DELETE FROM products WHERE product_id = $1;`

	result, err := r.db.Exec(query, productID)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("cannot delete product %s", productID)
	}

	return nil
}

func (r *neonProductRepository) IncrementSold(productID string, count int) error {
	query := `UPDATE products SET total_sold = COALESCE(total_sold, 0) + $1 WHERE product_id = $2;`
	_, err := r.db.Exec(query, count, productID)
	return err
}
