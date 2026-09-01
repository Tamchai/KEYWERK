package http

import (
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
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
	validator      *validator.Validate
}

func NewProductHandler(productService service.ProductService) ProductHandler {
	return &productHandler{
		productService: productService,
		validator:      validator.New(),
	}
}

// Keep backward compatibility for existing typo
func NewProductHanlder(productService service.ProductService) ProductHandler {
	return NewProductHandler(productService)
}

func (h *productHandler) CreateProduct(c *fiber.Ctx) error {
	var req dto.ReqProduct
	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	if err := h.validator.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	err = h.productService.CreateProduct(req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	msg := fmt.Sprintf("created product %s successfully", req.Name)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": msg})
}

func (h *productHandler) FindProductByID(c *fiber.Ctx) error {
	productID := c.Params("productID")

	product, err := h.productService.FindProduct(productID)
	if err != nil {
		if appErr, ok := err.(*errs.AppError); ok {
			return c.Status(appErr.Code).JSON(fiber.Map{"message": appErr.Message})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(product)
}

func (h *productHandler) ListProducts(c *fiber.Ctx) error {
	var filter dto.ProductFilterQuery
	_ = c.QueryParser(&filter)

	listProduct, err := h.productService.ListProducts(filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(listProduct)
}

func (h *productHandler) UpdateProduct(c *fiber.Ctx) error {
	productID := c.Params("productID")

	var req dto.ReqUpdateProduct
	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	err = h.productService.UpdateProduct(productID, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	msg := fmt.Sprintf("updated product %s successfully", req.Name)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": msg})
}

func (h *productHandler) DeleteProduct(c *fiber.Ctx) error {
	productID := c.Params("productID")

	err := h.productService.DeleteProduct(productID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
