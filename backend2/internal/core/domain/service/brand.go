package service

import (
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
	port "github.com/keywerk/internal/core/port/repository"
)

type BrandService interface {
	CreateBrand(req dto.ReqBrand) error
	FindBrandByID(brandID string) (*dto.ResBrand, error)
	ListBrands() (*[]dto.ResBrand, error)
	UpdateBrand(brandID string, req dto.ReqBrand) error
	DeleteBrand(brandID string) error
}

type brandService struct {
	brandRepo port.BrandRepository
}

func NewBrandSerivce(brandRepo port.BrandRepository) BrandService {
	return &brandService{brandRepo: brandRepo}
}

func (s *brandService) CreateBrand(req dto.ReqBrand) error {

	brand := dto.Brand{
		ID:   uuid.NewString(),
		Name: req.Name,
	}

	err := s.brandRepo.Save(brand)
	if err != nil {
		return errs.Internal("can't create brand", err)
	}

	return nil
}

func (s *brandService) FindBrandByID(brandID string) (*dto.ResBrand, error) {

	brand, err := s.brandRepo.Get(brandID)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// ส่ง Custom Error ชนิด NotFound สำหรับ Business Logic
			return nil, errs.NotFound("brand not found", err)
		}

		return nil, errs.Internal("failed to get brand", err)
	}

	resBrand := dto.ResBrand{
		ID:   brand.ID,
		Name: brand.Name,
	}

	return &resBrand, nil
}

func (s *brandService) ListBrands() (*[]dto.ResBrand, error) {

	listBrands, err := s.brandRepo.GetAll()
	if err != nil {
		return nil, errs.Internal("internal server error", err)
	}

	var resBrands []dto.ResBrand

	for _, v := range *listBrands {
		b := dto.ResBrand{
			ID:   v.ID,
			Name: v.Name,
		}

		resBrands = append(resBrands, b)

	}

	return &resBrands, nil
}

func (s *brandService) UpdateBrand(brandID string, req dto.ReqBrand) error {

	updateBrand := dto.Brand{
		Name: req.Name,
	}

	err := s.brandRepo.Update(updateBrand, brandID)
	if err != nil {
		return errs.Internal("can't update brand name", err)
	}

	return nil
}

func (s *brandService) DeleteBrand(brandID string) error {

	err := s.brandRepo.Delete(brandID)

	if err != nil {
		return errs.Internal("can't delete brand", err)
	}
	return nil
}
