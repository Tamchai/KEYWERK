package services

import (
	"fmt"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/google/uuid"
)

type ProductVariantService interface {
	CreateVariant(variant *core.ReqProductVariant) error
	GetVariantByID(id string) (*core.ResProductVariant, error)
	GetVariantsByProductID(productID string) ([]core.ResProductVariant, error)
}

type productVariantService struct {
	pvRepo ports.ProductVariantRepository
}

func NewProductVariantService(pvRepo ports.ProductVariantRepository) ProductVariantService {
	return &productVariantService{pvRepo: pvRepo}
}

func (s *productVariantService) CreateVariant(variant *core.ReqProductVariant) error {

	variantToSave := core.ProductVariant{
		ID:        uuid.NewString(),
		Name:      variant.Name,
		Stock:     variant.Stock,
		Price:     variant.Price,
		ProductID: variant.ProductID,
	}

	err := s.pvRepo.SaveVariant(&variantToSave)
	if err != nil {
		return err
	}

	return nil
}

func (s *productVariantService) GetVariantByID(id string) (*core.ResProductVariant, error) {

	variant, err := s.pvRepo.FindByVariantID(id)
	fmt.Println(variant)
	if err != nil {
		return nil, err
	}

	response := core.ResProductVariant{
		ID:        variant.ID,
		Name:      variant.Name,
		Price:     variant.Price,
		Stock:     variant.Stock,
		ProductID: variant.ProductID,
	}

	return &response, nil
}

func (s *productVariantService) GetVariantsByProductID(productID string) ([]core.ResProductVariant, error) {

	var response []core.ResProductVariant

	variants, err := s.pvRepo.FindVariantByProductID(productID)
	if err != nil {
		return nil, err
	}

	for i := range variants {
		var pv core.ResProductVariant
		pv.ID = variants[i].ID
		pv.Name = variants[i].Name
		pv.Price = variants[i].Price
		pv.Stock = variants[i].Stock
		pv.ProductID = variants[i].ProductID
		response = append(response, pv)
	}

	return response, nil
}
