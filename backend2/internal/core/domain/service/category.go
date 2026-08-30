package service

import (
	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
	port "github.com/keywerk/internal/core/port/repository"
)

type CategoryService interface {
	FindCategoryByID(categoryID string) (*dto.ResCategory, error)
	ListCategories() (*[]dto.ResCategory, error)
	UpdateCategory(categoryID string, reqCategory dto.ReqCategory) error
	DeleteCategory(categoryID string) error
	SaveCategory(reqCategory dto.ReqCategory) error
}

type categoryService struct {
	categoryRepo port.CategoryRepository
}

func NewCategoryService(categoryRepo port.CategoryRepository) CategoryService {
	return &categoryService{categoryRepo: categoryRepo}
}

func (s *categoryService) FindCategoryByID(categoryID string) (*dto.ResCategory, error) {

	category, err := s.categoryRepo.Get(categoryID)

	if err != nil {
		return nil, errs.Internal("not found category", err)
	}

	resCategory := dto.ResCategory{
		ID:   category.ID,
		Name: category.Name,
	}

	return &resCategory, nil
}

func (s *categoryService) ListCategories() (*[]dto.ResCategory, error) {
	var resCategory []dto.ResCategory

	categories, err := s.categoryRepo.GetAll()
	if err != nil {
		return nil, errs.Internal("not found categories", err)
	}

	for i := range len(categories) {
		c := dto.ResCategory{
			ID:   categories[i].ID,
			Name: categories[i].Name,
		}

		resCategory = append(resCategory, c)
	}

	return &resCategory, err
}

func (s *categoryService) UpdateCategory(categoryID string, reqCategory dto.ReqCategory) error {

	category := dto.Category{
		Name: reqCategory.Name,
	}

	err := s.categoryRepo.Update(categoryID, category)

	if err != nil {
		return errs.Internal("can't update category", err)
	}

	return nil
}

func (s *categoryService) DeleteCategory(categoryID string) error {

	err := s.categoryRepo.Delete(categoryID)
	if err != nil {
		return errs.Internal("can't delete category", err)
	}

	return nil
}

func (s *categoryService) SaveCategory(reqCategory dto.ReqCategory) error {

	category := dto.Category{
		ID:   uuid.NewString(),
		Name: reqCategory.Name,
	}

	err := s.categoryRepo.Save(category)
	if err != nil {
		return errs.Internal("can't insert category", err)
	}

	return nil
}
