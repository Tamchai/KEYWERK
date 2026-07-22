package handlers

import (
	"strings"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/services"
	"github.com/gofiber/fiber/v2"
)

type BrandHandler interface {
	CreateBrand(c *fiber.Ctx) error
	GetBrandByID(c *fiber.Ctx) error
	GetAllBrands(c *fiber.Ctx) error
	UpdateBrand(c *fiber.Ctx) error
	DeleteBrand(c *fiber.Ctx) error
}

type brandHandler struct {
	brandService services.BrandService
}

// Constructor สำหรับสร้าง Handler Instance
func NewBrandHandler(brandService services.BrandService) BrandHandler {
	return &brandHandler{
		brandService: brandService,
	}
}

func (h *brandHandler) CreateBrand(c *fiber.Ctx) error {
	var req core.ReqBrand

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	if strings.TrimSpace(req.Name) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "brand name cannot be empty"})
	}

	err := h.brandService.CreateBrand(req)
	if err != nil {
		if err.Error() == "brand name already exists" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "cannot create brand"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "brand created successfully"})
}

func (h *brandHandler) GetBrandByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if strings.TrimSpace(id) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid brand id"})
	}

	brand, err := h.brandService.GetBrandByID(id)
	if err != nil {
		if err.Error() == "brand not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "failed to retrieve brand"})
	}

	return c.Status(fiber.StatusOK).JSON(brand)
}

func (h *brandHandler) GetAllBrands(c *fiber.Ctx) error {
	brands, err := h.brandService.GetAllBrands()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "failed to retrieve brands"})
	}

	if brands == nil {
		brands = []core.Brand{}
	}

	return c.Status(fiber.StatusOK).JSON(brands)
}

func (h *brandHandler) UpdateBrand(c *fiber.Ctx) error {
	id := c.Params("id")
	if strings.TrimSpace(id) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid brand id"})
	}

	var req core.ReqBrand
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	if strings.TrimSpace(req.Name) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "brand name cannot be empty"})
	}

	err := h.brandService.UpdateBrand(id, req)
	if err != nil {
		if err.Error() == "brand not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": err.Error()})
		}
		if err.Error() == "brand name already exists" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "cannot update brand"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "brand updated successfully"})
}

func (h *brandHandler) DeleteBrand(c *fiber.Ctx) error {
	id := c.Params("id")
	if strings.TrimSpace(id) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid brand id"})
	}

	err := h.brandService.DeleteBrand(id)
	if err != nil {
		if err.Error() == "brand not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "cannot delete brand"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "brand deleted successfully"})
}
