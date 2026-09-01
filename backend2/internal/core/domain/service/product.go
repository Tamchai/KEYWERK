package service

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
	port "github.com/keywerk/internal/core/port/repository"
)

type ProductService interface {
	CreateProduct(reqProduct dto.ReqProduct) error
	ListProducts(filter dto.ProductFilterQuery) ([]dto.ResProduct, error)
	FindProduct(productID string) (*dto.ResProduct, error)
	UpdateProduct(productID string, updateProduct dto.ReqUpdateProduct) error
	DeleteProduct(productID string) error
}

type productService struct {
	productRepo port.ProductRepository
}

func NewProductService(productRepo port.ProductRepository) ProductService {
	return &productService{productRepo: productRepo}
}

func (s *productService) CreateProduct(reqProduct dto.ReqProduct) error {
	product := dto.Product{
		ID:          uuid.NewString(),
		CategoryID:  reqProduct.CategoryID,
		BrandID:     reqProduct.BrandID,
		Name:        reqProduct.Name,
		Description: reqProduct.Description,
		TotalSold:   0,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	err := s.productRepo.Create(product)
	if err != nil {
		msg := fmt.Sprintf("cannot create product %s", reqProduct.Name)
		return errs.Internal(msg, err)
	}
	return nil
}

func (s *productService) ListProducts(filter dto.ProductFilterQuery) ([]dto.ResProduct, error) {
	products, err := s.productRepo.GetAll(filter)
	if err != nil {
		return nil, errs.Internal("cannot get products", err)
	}

	resProducts := make([]dto.ResProduct, 0, len(products))
	for _, p := range products {
		resProducts = append(resProducts, dto.ResProduct{
			ID:          p.ID,
			CategoryID:  p.CategoryID,
			BrandID:     p.BrandID,
			Name:        p.Name,
			Description: p.Description,
			TotalSold:   p.TotalSold,
		})
	}

	return resProducts, nil
}

func (s *productService) FindProduct(productID string) (*dto.ResProduct, error) {
	product, err := s.productRepo.Get(productID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errs.NotFound(fmt.Sprintf("product not found: %s", productID), err)
		}
		return nil, errs.Internal(fmt.Sprintf("cannot get product: %s", productID), err)
	}

	resProduct := dto.ResProduct{
		ID:          product.ID,
		CategoryID:  product.CategoryID,
		BrandID:     product.BrandID,
		Name:        product.Name,
		Description: product.Description,
		TotalSold:   product.TotalSold,
	}

	return &resProduct, nil
}

func (s *productService) UpdateProduct(productID string, updateProduct dto.ReqUpdateProduct) error {
	product, err := s.productRepo.Get(productID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errs.NotFound(fmt.Sprintf("product not found: %s", productID), err)
		}
		return errs.Internal(fmt.Sprintf("cannot get product: %s", productID), err)
	}

	if updateProduct.CategoryID != "" {
		product.CategoryID = updateProduct.CategoryID
	}
	if updateProduct.BrandID != "" {
		product.BrandID = updateProduct.BrandID
	}
	if updateProduct.Name != "" {
		product.Name = updateProduct.Name
	}
	if updateProduct.Description != "" {
		product.Description = updateProduct.Description
	}
	product.UpdatedAt = time.Now()

	err = s.productRepo.Update(productID, *product)
	if err != nil {
		msg := fmt.Sprintf("cannot update product %s", product.Name)
		return errs.Internal(msg, err)
	}

	return nil
}

func (s *productService) DeleteProduct(productID string) error {
	_, err := s.productRepo.Get(productID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errs.NotFound(fmt.Sprintf("product not found: %s", productID), err)
		}
		return errs.Internal(fmt.Sprintf("cannot get product: %s", productID), err)
	}

	err = s.productRepo.Delete(productID)
	if err != nil {
		msg := fmt.Sprintf("cannot delete product %s", productID)
		return errs.Internal(msg, err)
	}

	return nil
}
