package http

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/service"
)

type ProductHandler interface {
	CreateProduct(c *fiber.Ctx) error
	ListProducts(c *fiber.Ctx) error
	FindProductByID(c *fiber.Ctx) error
	UpdateProduct(c *fiber.Ctx) error
	DeleteProduct(c *fiber.Ctx) error
}

type productHandler struct {
	productService service.ProductService
}

func NewProductHanlder(productService service.ProductService) ProductHandler {
	return &productHandler{productService: productService}
}

func (h *productHandler) CreateProduct(c *fiber.Ctx) error {

	var req dto.ReqProduct

	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid body"})
	}

	fmt.Println(req)

	err = h.productService.CreateProduct(req)
	if err != nil {
		return err
	}

	msg := fmt.Sprintf("create product %s", req.Name)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": msg})
}

func (h *productHandler) FindProductByID(c *fiber.Ctx) error {

	productID := c.Params("productID")

	product, err := h.productService.FindProduct(productID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(product)
}

func (h *productHandler) ListProducts(c *fiber.Ctx) error {

	listProduct, err := h.productService.ListProducts()
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(listProduct)
}

func (h *productHandler) UpdateProduct(c *fiber.Ctx) error {

	productID := c.Params("productID")

	var req dto.ReqUpdateProduct

	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid body"})
	}
	fmt.Println(req)

	err = h.productService.UpdateProduct(productID, req)
	if err != nil {
		return err
	}

	msg := fmt.Sprintf("updated product %s", req.Name)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": msg})
}

func (h *productHandler) DeleteProduct(c *fiber.Ctx) error {

	productID := c.Params("productID")

	err := h.productService.DeleteProduct(productID)
	if err != nil {
		return err
	}

	return c.SendStatus(fiber.StatusNoContent)
}
