package adapters

import (
	"database/sql"
	"errors"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/jmoiron/sqlx"
)

type brandRepository struct {
	db *sqlx.DB
}

func NewBrandRepository(db *sqlx.DB) ports.BrandRepository {
	return &brandRepository{db}
}

// 1. Create: บันทึกแบรนด์ใหม่ลงฐานข้อมูล
func (r *brandRepository) Save(brand core.Brand) error {
	query := `INSERT INTO brands (brand_id, name) VALUES ($1, $2)`

	_, err := r.db.Exec(query, brand.ID, brand.Name)
	if err != nil {
		return err
	}
	return nil
}

func (r *brandRepository) FindByID(id string) (*core.Brand, error) {
	query := `SELECT brand_id, name FROM brands WHERE brand_id = $1`

	var brand core.Brand
	err := r.db.QueryRow(query, id).Scan(&brand.ID, &brand.Name)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &brand, nil
}

func (r *brandRepository) FindAll() ([]core.Brand, error) {
	query := `SELECT brand_id, name FROM brands ORDER BY name ASC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var brands []core.Brand
	for rows.Next() {
		var brand core.Brand
		err := rows.Scan(&brand.ID, &brand.Name)
		if err != nil {
			return nil, err
		}
		brands = append(brands, brand)
	}

	return brands, nil
}

func (r *brandRepository) Update(id string, brand core.Brand) error {
	query := `UPDATE brands SET name = $1 WHERE brand_id = $2`

	result, err := r.db.Exec(query, brand.Name, id)
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

func (r *brandRepository) Delete(id string) error {
	query := `DELETE FROM brands WHERE brand_id = $1`

	result, err := r.db.Exec(query, id)
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

func (r *brandRepository) IsBrandNameExists(name string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM brands WHERE LOWER(name) = LOWER($1))`

	var exists bool
	err := r.db.QueryRow(query, name).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}
