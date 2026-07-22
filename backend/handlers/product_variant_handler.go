package handlers

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/services"
	"github.com/gofiber/fiber/v2"
)

type ProductVariantHandler interface {
	CreateVariant(c *fiber.Ctx) error
	GetVariantByID(c *fiber.Ctx) error
	GetVariantsByProductID(c *fiber.Ctx) error
}

type productVariantHandler struct {
	pvService services.ProductVariantService
}

func NewProductVariantHandler(pvService services.ProductVariantService) ProductVariantHandler {
	return &productVariantHandler{pvService: pvService}
}

func (h *productVariantHandler) CreateVariant(c *fiber.Ctx) error {
	var req core.ReqProductVariant

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "รูปแบบข้อมูลไม่ถูกต้อง (Invalid Request Body)",
		})
	}

	err := h.pvService.CreateVariant(&req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "สร้างตัวเลือกสินค้าสำเร็จเรียบร้อย!",
	})
}

func (h *productVariantHandler) GetVariantByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "กรุณาระบุ Variant ID ให้ถูกต้อง",
		})
	}

	res, err := h.pvService.GetVariantByID(id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	if res == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "ไม่พบข้อมูลตัวเลือกสินค้านี้ในระบบ",
		})
	}

	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *productVariantHandler) GetVariantsByProductID(c *fiber.Ctx) error {
	productID := c.Params("productId")
	if productID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "กรุณาระบุ Product ID ให้ถูกต้อง",
		})
	}

	res, err := h.pvService.GetVariantsByProductID(productID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(res)
}
