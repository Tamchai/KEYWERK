package neon

import (
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/keywerk/internal/core/domain/dto"
	port "github.com/keywerk/internal/core/port/repository"
)

type neonCategoryRepository struct {
	db *sqlx.DB
}

func NewNeonCategoryRepository(db *sqlx.DB) port.CategoryRepository {
	return &neonCategoryRepository{db: db}
}

func (r *neonCategoryRepository) GetAll() ([]dto.Category, error) {
	var categories []dto.Category
	query := `SELECT category_id, name FROM categories`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var c dto.Category
		err = rows.Scan(&c.ID, &c.Name)
		if err != nil {
			return nil, err
		}

		categories = append(categories, c)
	}

	return categories, nil
}

func (r *neonCategoryRepository) Get(categoryID string) (*dto.Category, error) {

	query := `
	SELECT category_id, name FROM categories WHERE category_id = $1;
	`

	var category dto.Category

	err := r.db.QueryRow(query, categoryID).Scan(&category.ID, &category.Name)

	if err != nil {
		return nil, err
	}

	return &category, nil
}

func (r *neonCategoryRepository) Save(category dto.Category) error {
	query := `INSERT INTO categories (category_id, name) VALUES ($1, $2)`

	result, err := r.db.Exec(query, category.ID, category.Name)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return errors.New("can't insert category")
	}

	return nil
}

func (r *neonCategoryRepository) Update(categoryID string, category dto.Category) error {
	query := `UPDATE categories SET name = $1 WHERE category_id = $2`
	result, err := r.db.Exec(query, category.Name, category.ID)

	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return errors.New("can't update category")
	}

	return nil
}

func (r *neonCategoryRepository) Delete(categoryID string) error {
	query := `DELETE FROM categories WHERE category_id = $1`
	result, err := r.db.Exec(query, categoryID)

	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return errors.New("can't delete category")
	}

	return nil
}
