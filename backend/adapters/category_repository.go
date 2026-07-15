package adapters

import (
	"errors"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/jmoiron/sqlx"
)

type categoryRepository struct {
	db *sqlx.DB
}

func NewCategoryRepository(db *sqlx.DB) ports.CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) Get() ([]core.Category, error) {

	var categories []core.Category
	query := `SELECT category_id, name FROM categories`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var c core.Category
		err = rows.Scan(&c.ID, &c.Name)
		if err != nil {
			return nil, err
		}

		categories = append(categories, c)
	}

	return categories, nil
}

func (r *categoryRepository) Update(categoryID string, category core.Category) error {
	query := `UPDATE categories SET (name = $1) WHERE category_id = $2`
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

func (r *categoryRepository) Delete(categoryID string) error {

	query := `DELETE FROM categories WHERE category_id = $2`
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

func (r *categoryRepository) Save(category core.Category) error {
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
