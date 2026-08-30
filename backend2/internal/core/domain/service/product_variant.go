package service

import (
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
	port "github.com/keywerk/internal/core/port/repository"
)

type ProductVariantService interface {
	CreateProductVariant(req dto.ReqProductVariant) error
	FingProductVariantByID(id string) (*dto.ResProductVariant, error)
	DeleteProductVariant(id string) error
}

type productvariantService struct {
	productvariantRepo port.ProductVariantRepository
}

func NewProductVariantService(productvariantRepo port.ProductVariantRepository) ProductVariantService {
	return &productvariantService{productvariantRepo: productvariantRepo}
}

func (s *productvariantService) CreateProductVariant(req dto.ReqProductVariant) error {

	attributes, err := json.Marshal(req.Attributes)
	if err != nil {
		return err
	}

	// เรียก func GetimageID -> imageID

	variant := dto.ProductVariant{
		ID:         uuid.NewString(),
		ProductID:  req.ProductID,
		ImageID:    "เอามาจากการเรียกฟังชั่น getimageid",
		Name:       req.Name,
		Stock:      req.Stock,
		Price:      req.Price,
		SoldCount:  0,
		Attributes: attributes,
	}

	err = s.productvariantRepo.Create(variant)
	if err != nil {
		msg := fmt.Sprintf("can't created variant %s", variant.Name)
		return errs.Internal(msg, err)
	}

	return nil
}

func (s *productvariantService) FingProductVariantByID(id string) (*dto.ResProductVariant, error) {

	variant, err := s.productvariantRepo.FindByID(id)
	if err != nil {
		msg := fmt.Sprintf("can't found variant %s", id)
		return nil, errs.BadRequest(msg, err)
	}

	var attributes map[string]any

	if len(variant.Attributes) > 0 {
		err = json.Unmarshal(variant.Attributes, &attributes)
		if err != nil {
			msg := fmt.Sprintf("can't parse attributes for variant %s", id)
			return nil, errs.Internal(msg, err)
		}
	}

	res := &dto.ResProductVariant{
		ID:         variant.ID,
		ProductID:  variant.ProductID,
		Name:       variant.Name,
		Stock:      variant.Stock,
		Price:      variant.Price,
		SoldCount:  variant.SoldCount,
		Attributes: attributes,
		ImageID:    variant.ImageID,
	}

	return res, nil
}

func (s *productvariantService) DeleteProductVariant(id string) error {

	err := s.productvariantRepo.Delete(id)
	if err != nil {
		msg := fmt.Sprintf("can't deleted variant %s", id)
		return errs.Internal(msg, err)
	}

	return nil
}
