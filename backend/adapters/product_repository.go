package adapters

import (
	"errors"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/jmoiron/sqlx"
)

type productRepository struct {
	db *sqlx.DB
}

func NewProductRepository(db *sqlx.DB) ports.ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) Save(product core.Product) error {

	query := `INSERT INTO products (product_id, category_id, brand_id, image, name, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	result, err := r.db.Exec(query,
		product.ID,
		product.CategoryID,
		product.BrandID,
		product.Image,
		product.Name,
		product.Description,
		product.Created_at,
		product.Updated_at,
	)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return errors.New("error cannot insert")
	}

	return nil
}

func (r *productRepository) GetAll() ([]core.Product, error) {

	query := `
	SELECT 
		p.product_id, p.image, p.name, p.description, 
		c.category_id, c.name, 
		b.brand_id, b.name,
		pv.variant_id, pv.name, pv.stock, pv.price
	FROM 
		products AS p
	INNER JOIN 
		categories AS c ON p.category_id = c.category_id
	INNER JOIN 
		brands AS b ON p.brand_id = b.brand_id
	INNER JOIN 
		productvariants AS pv ON p.product_id = pv.product_id
	`

	productMap := make(map[string]*core.Product)
	var orderedIDs []string

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var p core.Product
		var c core.Category
		var b core.Brand
		var pv core.Pv
		err = rows.Scan(
			&p.ID, &p.Image, &p.Name, &p.Description,
			&c.ID, &c.Name,
			&b.ID, &b.Name,
			&pv.ID, &pv.Name, &pv.Stock, &pv.Price,
		)

		if err != nil {
			return nil, err
		}

		existsProduct, exists := productMap[p.ID]
		if exists {
			existsProduct.ProductVariants = append(existsProduct.ProductVariants, pv)
		} else {
			p.Category = c
			p.Brand = b
			p.ProductVariants = []core.Pv{pv}
			orderedIDs = append(orderedIDs, p.ID)
			productMap[p.ID] = &p
		}

	}
	var products []core.Product
	for _, id := range orderedIDs {
		products = append(products, *productMap[id])
	}

	if products == nil {
		products = []core.Product{}
	}

	return products, nil
}

func (r *productRepository) Update(productID string, product core.Product) error {
	return nil
}

func (r *productRepository) Delete(productID string) error {
	return nil
}

func (r *productRepository) FindByID(productID string) (*core.Product, error) {
	return nil, nil
}
