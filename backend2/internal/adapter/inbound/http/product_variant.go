package http

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/service"
)

type ProductVariantHandler interface {
	CreateProductVariant(c *fiber.Ctx) error
	FingProductVariantByID(c *fiber.Ctx) error
	DeleteProductVariant(c *fiber.Ctx) error
}

type productVariantHandler struct {
	productVariantService service.ProductVariantService
}

func NewProductVariantHandler(productVariantService service.ProductVariantService) ProductVariantHandler {
	return &productVariantHandler{productVariantService: productVariantService}
}

func (h *productVariantHandler) CreateProductVariant(c *fiber.Ctx) error {

	var req dto.ReqProductVariant

	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid body"})
	}

	err = h.productVariantService.CreateProductVariant(req)
	if err != nil {
		return err
	}

	msg := fmt.Sprintf("created variant %s", req.Name)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": msg})
}

func (h *productVariantHandler) FingProductVariantByID(c *fiber.Ctx) error {

	variantID := c.Params("variantID")

	res, err := h.productVariantService.FingProductVariantByID(variantID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *productVariantHandler) DeleteProductVariant(c *fiber.Ctx) error {

	variantID := c.Params("variantID")

	err := h.productVariantService.DeleteProductVariant(variantID)
	if err != nil {
		return err
	}

	return c.SendStatus(fiber.StatusNoContent)

}
