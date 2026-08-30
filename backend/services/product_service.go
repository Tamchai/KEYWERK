package services

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
)

type ProductService interface {
	GetAllProduct() ([]core.ResProduct, error)
}

type productService struct {
	productRepo ports.ProductRepository
}

func NewProductService(productRepo ports.ProductRepository) ProductService {
	return &productService{productRepo: productRepo}
}

func (s *productService) GetAllProduct() ([]core.ResProduct, error) {
	var product core.ResProduct

	var response []core.ResProduct

	products, err := s.productRepo.GetAll()
	if err != nil {
		return nil, err
	}

	for i := range products {
		product.ID = products[i].ID
		product.Image = products[i].Image
		product.Name = products[i].Name
		product.Description = products[i].Description

		product.Category = products[i].Category
		product.Brand = products[i].Brand
		product.ProductVariants = products[i].ProductVariants

		response = append(response, product)
	}

	return response, nil

}
