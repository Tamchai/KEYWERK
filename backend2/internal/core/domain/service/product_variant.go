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
	FindProductVariantByID(id string) (*dto.ResProductVariant, error)
	GetVariantsByProductID(productID string) ([]dto.ResProductVariant, error)
	GetAllProductVariants() ([]dto.ResProductVariant, error)
	UpdateProductVariant(id string, req dto.ReqUpdateProductVariant) error
	DeleteProductVariant(id string) error
}

type productvariantService struct {
	productvariantRepo port.ProductVariantRepository
}

func NewProductVariantService(productvariantRepo port.ProductVariantRepository) ProductVariantService {
	return &productvariantService{productvariantRepo: productvariantRepo}
}

func (s *productvariantService) CreateProductVariant(req dto.ReqProductVariant) error {
	var attributes []byte
	var err error
	if req.Attributes != nil {
		attributes, err = json.Marshal(req.Attributes)
		if err != nil {
			return errs.BadRequest("invalid attributes json", err)
		}
	} else {
		attributes = []byte("{}")
	}

	variant := dto.ProductVariant{
		ID:         uuid.NewString(),
		ProductID:  req.ProductID,
		ImageID:    req.ImageID,
		Name:       req.Name,
		Stock:      req.Stock,
		Price:      req.Price,
		SoldCount:  0,
		Attributes: attributes,
	}

	err = s.productvariantRepo.Create(variant)
	if err != nil {
		msg := fmt.Sprintf("cannot create variant %s", variant.Name)
		return errs.Internal(msg, err)
	}

	return nil
}

func (s *productvariantService) FindProductVariantByID(id string) (*dto.ResProductVariant, error) {
	variant, err := s.productvariantRepo.FindByID(id)
	if err != nil {
		msg := fmt.Sprintf("variant not found: %s", id)
		return nil, errs.NotFound(msg, err)
	}

	var attributes map[string]any
	if len(variant.Attributes) > 0 {
		_ = json.Unmarshal(variant.Attributes, &attributes)
	}

	res := &dto.ResProductVariant{
		ID:         variant.ID,
		ProductID:  variant.ProductID,
		ImageID:    variant.ImageID,
		ImageURL:   variant.ImageURL,
		Name:       variant.Name,
		Stock:      variant.Stock,
		Price:      variant.Price,
		SoldCount:  variant.SoldCount,
		Attributes: attributes,
	}

	return res, nil
}

func (s *productvariantService) GetVariantsByProductID(productID string) ([]dto.ResProductVariant, error) {
	variants, err := s.productvariantRepo.GetByProductID(productID)
	if err != nil {
		return nil, errs.Internal("cannot get product variants", err)
	}

	resList := make([]dto.ResProductVariant, 0, len(variants))
	for _, v := range variants {
		var attributes map[string]any
		if len(v.Attributes) > 0 {
			_ = json.Unmarshal(v.Attributes, &attributes)
		}

		resList = append(resList, dto.ResProductVariant{
			ID:         v.ID,
			ProductID:  v.ProductID,
			ImageID:    v.ImageID,
			ImageURL:   v.ImageURL,
			Name:       v.Name,
			Stock:      v.Stock,
			Price:      v.Price,
			SoldCount:  v.SoldCount,
			Attributes: attributes,
		})
	}

	return resList, nil
}

func (s *productvariantService) GetAllProductVariants() ([]dto.ResProductVariant, error) {
	variants, err := s.productvariantRepo.GetAll()
	if err != nil {
		return nil, errs.Internal("cannot get all variants", err)
	}

	resList := make([]dto.ResProductVariant, 0, len(variants))
	for _, v := range variants {
		var attributes map[string]any
		if len(v.Attributes) > 0 {
			_ = json.Unmarshal(v.Attributes, &attributes)
		}

		resList = append(resList, dto.ResProductVariant{
			ID:         v.ID,
			ProductID:  v.ProductID,
			ImageID:    v.ImageID,
			ImageURL:   v.ImageURL,
			Name:       v.Name,
			Stock:      v.Stock,
			Price:      v.Price,
			SoldCount:  v.SoldCount,
			Attributes: attributes,
		})
	}

	return resList, nil
}

func (s *productvariantService) UpdateProductVariant(id string, req dto.ReqUpdateProductVariant) error {
	existing, err := s.productvariantRepo.FindByID(id)
	if err != nil {
		msg := fmt.Sprintf("variant not found: %s", id)
		return errs.NotFound(msg, err)
	}

	if req.Name != "" {
		existing.Name = req.Name
	}
	if req.ImageID != "" {
		existing.ImageID = req.ImageID
	}
	if req.Stock != nil {
		existing.Stock = *req.Stock
	}
	if req.Price != nil {
		existing.Price = *req.Price
	}
	if req.Attributes != nil {
		attributesBytes, err := json.Marshal(req.Attributes)
		if err == nil {
			existing.Attributes = attributesBytes
		}
	}

	err = s.productvariantRepo.Update(id, *existing)
	if err != nil {
		msg := fmt.Sprintf("cannot update variant %s", id)
		return errs.Internal(msg, err)
	}

	return nil
}

func (s *productvariantService) DeleteProductVariant(id string) error {
	_, err := s.productvariantRepo.FindByID(id)
	if err != nil {
		msg := fmt.Sprintf("variant not found: %s", id)
		return errs.NotFound(msg, err)
	}

	err = s.productvariantRepo.Delete(id)
	if err != nil {
		msg := fmt.Sprintf("cannot delete variant %s", id)
		return errs.Internal(msg, err)
	}

	return nil
}
