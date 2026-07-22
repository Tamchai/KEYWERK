package handlers

import (
	"github.com/MaKo114/KEYWERK/services"
	"github.com/gofiber/fiber/v2"
)

type ProductHandler interface {
	GetAllProducts(c *fiber.Ctx) error
}

type productHandler struct {
	productService services.ProductService
}

func NewProductHandler(productService services.ProductService) ProductHandler {
	return &productHandler{productService: productService}
}

func (h *productHandler) GetAllProducts(c *fiber.Ctx) error {
	products, err := h.productService.GetAllProduct()
	if err != nil {
		return c.Status(
			404,
		).JSON(fiber.Map{"message": "not found products"})
	}
	return c.Status(200).JSON(products)
}
