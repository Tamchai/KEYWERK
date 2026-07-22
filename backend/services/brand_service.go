package services

import (
	"errors"
	"fmt"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/google/uuid"
)

type BrandService interface {
	CreateBrand(req core.ReqBrand) error
	GetBrandByID(id string) (*core.Brand, error)
	GetAllBrands() ([]core.Brand, error)
	UpdateBrand(id string, req core.ReqBrand) error
	DeleteBrand(id string) error
}

type brandService struct {
	brandRepo ports.BrandRepository
}

func NewBrandService(brandRepo ports.BrandRepository) BrandService {
	return &brandService{
		brandRepo: brandRepo,
	}
}

func (s *brandService) CreateBrand(req core.ReqBrand) error {

	exists, err := s.brandRepo.IsBrandNameExists(req.Name)
	if err != nil {
		return fmt.Errorf("failed to check brand existence: %w", err)
	}
	if exists {
		return errors.New("brand name already exists")
	}

	newBrand := core.Brand{
		ID:   uuid.NewString(),
		Name: req.Name,
	}

	err = s.brandRepo.Save(newBrand)
	if err != nil {
		return fmt.Errorf("failed to save brand: %w", err)
	}

	return nil
}

func (s *brandService) GetBrandByID(id string) (*core.Brand, error) {
	brand, err := s.brandRepo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to find brand: %w", err)
	}
	if brand == nil {
		return nil, errors.New("brand not found")
	}

	return brand, nil
}

func (s *brandService) GetAllBrands() ([]core.Brand, error) {
	brands, err := s.brandRepo.FindAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get all brands: %w", err)
	}

	return brands, nil
}

func (s *brandService) UpdateBrand(id string, req core.ReqBrand) error {

	existingBrand, err := s.brandRepo.FindByID(id)
	if err != nil {
		return fmt.Errorf("failed to check existing brand: %w", err)
	}
	if existingBrand == nil {
		return errors.New("brand not found")
	}

	if existingBrand.Name != req.Name {
		exists, err := s.brandRepo.IsBrandNameExists(req.Name)
		if err != nil {
			return fmt.Errorf("failed to check brand existence: %w", err)
		}
		if exists {
			return errors.New("brand name already exists")
		}
	}

	updatedBrand := core.Brand{
		Name: req.Name,
	}

	err = s.brandRepo.Update(id, updatedBrand)
	if err != nil {
		return fmt.Errorf("failed to update brand: %w", err)
	}

	return nil
}

func (s *brandService) DeleteBrand(id string) error {

	existingBrand, err := s.brandRepo.FindByID(id)
	if err != nil {
		return fmt.Errorf("failed to check brand before delete: %w", err)
	}
	if existingBrand == nil {
		return errors.New("brand not found")
	}

	err = s.brandRepo.Delete(id)
	if err != nil {
		return fmt.Errorf("failed to delete brand: %w", err)
	}

	return nil
}
