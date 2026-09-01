package http

import (
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/service"
)

type ProductVariantHandler interface {
	CreateProductVariant(c *fiber.Ctx) error
	FindProductVariantByID(c *fiber.Ctx) error
	FingProductVariantByID(c *fiber.Ctx) error // Alias for backward compatibility
	GetVariantsByProductID(c *fiber.Ctx) error
	GetAllProductVariants(c *fiber.Ctx) error
	UpdateProductVariant(c *fiber.Ctx) error
	DeleteProductVariant(c *fiber.Ctx) error
}

type productVariantHandler struct {
	productVariantService service.ProductVariantService
	validator             *validator.Validate
}

func NewProductVariantHandler(productVariantService service.ProductVariantService) ProductVariantHandler {
	return &productVariantHandler{
		productVariantService: productVariantService,
		validator:             validator.New(),
	}
}

func (h *productVariantHandler) CreateProductVariant(c *fiber.Ctx) error {
	var req dto.ReqProductVariant
	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	if err := h.validator.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	err = h.productVariantService.CreateProductVariant(req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	msg := fmt.Sprintf("created variant %s successfully", req.Name)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": msg})
}

func (h *productVariantHandler) FindProductVariantByID(c *fiber.Ctx) error {
	variantID := c.Params("variantID")

	res, err := h.productVariantService.FindProductVariantByID(variantID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *productVariantHandler) FingProductVariantByID(c *fiber.Ctx) error {
	return h.FindProductVariantByID(c)
}

func (h *productVariantHandler) GetVariantsByProductID(c *fiber.Ctx) error {
	productID := c.Params("productID")

	variants, err := h.productVariantService.GetVariantsByProductID(productID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(variants)
}

func (h *productVariantHandler) GetAllProductVariants(c *fiber.Ctx) error {
	variants, err := h.productVariantService.GetAllProductVariants()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(variants)
}

func (h *productVariantHandler) UpdateProductVariant(c *fiber.Ctx) error {
	variantID := c.Params("variantID")

	var req dto.ReqUpdateProductVariant
	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	err = h.productVariantService.UpdateProductVariant(variantID, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "variant updated successfully"})
}

func (h *productVariantHandler) DeleteProductVariant(c *fiber.Ctx) error {
	variantID := c.Params("variantID")

	err := h.productVariantService.DeleteProductVariant(variantID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
