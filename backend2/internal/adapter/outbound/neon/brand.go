package neon

import (
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/keywerk/internal/core/domain/dto"
	port "github.com/keywerk/internal/core/port/repository"
)

type neonBrandRepository struct {
	db *sqlx.DB
}

func NewNeonBrandRepository(db *sqlx.DB) port.BrandRepository {
	return &neonBrandRepository{db: db}
}

func (r *neonBrandRepository) GetAll() (*[]dto.Brand, error) {

	query := `SELECT brand_id, name FROM brands ORDER BY name ASC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var brands []dto.Brand
	for rows.Next() {
		var brand dto.Brand
		err := rows.Scan(&brand.ID, &brand.Name)
		if err != nil {
			return nil, err
		}
		brands = append(brands, brand)
	}

	return &brands, nil
}

func (r *neonBrandRepository) Get(brandID string) (*dto.Brand, error) {
	query := `SELECT brand_id, name FROM brands WHERE brand_id = $1 ORDER BY name ASC;`

	var brands dto.Brand

	err := r.db.QueryRow(query, brandID).Scan(&brands.ID, &brands.Name)
	if err != nil {
		return nil, err
	}

	return &brands, nil
}

func (r *neonBrandRepository) Save(brand dto.Brand) error {
	query := `INSERT INTO brands (brand_id, name) VALUES ($1, $2)`

	result, err := r.db.Exec(query, brand.ID, brand.Name)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return errors.New("cannot insert brand")
	}

	return nil
}

func (r *neonBrandRepository) Update(brand dto.Brand, brandID string) error {
	query := `UPDATE brands SET name = $1 WHERE brand_id = $2`

	result, err := r.db.Exec(query, brand.Name, brandID)
	if err != nil {

		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected <= 0 {
		return errors.New("brand not found or no changes made")
	}

	return nil
}

func (r *neonBrandRepository) Delete(brandID string) error {

	query := `
	DELETE FROM brands 
	WHERE brand_id = $1;
	`

	result, err := r.db.Exec(query, brandID)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected <= 0 {
		return errors.New("brand not found")
	}

	return nil
}
