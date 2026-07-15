package services

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/google/uuid"
)

type CategoryService interface {
	GetAll() ([]core.ResCategory, error)
	UpdateCategory(categoryID string, categoryName core.ReqCategory) error
	DeleteCategory(categoryID string) error
	SaveCategory(reqCategory core.ReqCategory) error
}

type categoryService struct {
	categoryRepo ports.CategoryRepository
}

func NewCategoryService(categoryRepo ports.CategoryRepository) CategoryService {
	return &categoryService{categoryRepo: categoryRepo}
}

func (s *categoryService) GetAll() ([]core.ResCategory, error) {
	var resCategory []core.ResCategory

	categories, err := s.categoryRepo.Get()
	if err != nil {
		return nil, err
	}

	for i := range len(categories) {
		c := core.ResCategory{
			ID:   categories[i].ID,
			Name: categories[i].Name,
		}

		resCategory = append(resCategory, c)
	}

	return resCategory, err
}

func (s *categoryService) UpdateCategory(categoryID string, reqCategory core.ReqCategory) (err error) {

	category := core.Category{
		ID:   categoryID,
		Name: reqCategory.Name,
	}

	return s.categoryRepo.Update(categoryID, category)
}

func (s *categoryService) DeleteCategory(categoryID string) (err error) {

	return s.categoryRepo.Delete(categoryID)
}

func (s *categoryService) SaveCategory(reqCategory core.ReqCategory) (err error) {

	category := core.Category{
		ID:   uuid.NewString(),
		Name: reqCategory.Name,
	}

	return s.categoryRepo.Save(category)
}
