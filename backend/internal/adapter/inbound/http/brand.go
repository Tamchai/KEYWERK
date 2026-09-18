package http

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
	"github.com/keywerk/internal/core/domain/service"
)

type BrandHandler interface {
	CreateBrand(c *fiber.Ctx) error
	GetBrandByID(c *fiber.Ctx) error
	GetAllBrands(c *fiber.Ctx) error
	UpdateBrand(c *fiber.Ctx) error
	DeleteBrand(c *fiber.Ctx) error
}

type brandHandler struct {
	brandService service.BrandService
	validator    *validator.Validate
}

func NewBrandHandler(brandService service.BrandService) BrandHandler {
	return &brandHandler{brandService: brandService, validator: validator.New()}
}

func (h *brandHandler) CreateBrand(c *fiber.Ctx) error {

	var req dto.ReqBrand

	err := c.BodyParser(&req)
	if err != nil {
		return errs.BadRequest("invalid request body", err)
	}
	req.Name = strings.TrimSpace(req.Name)
	if err := h.validator.Struct(req); err != nil {
		return errs.BadRequest("brand name is required", err)
	}

	err = h.brandService.CreateBrand(req)
	if err != nil {
		return err
	}

	msg := fmt.Sprintf("created brand %v successfully", req.Name)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": msg})
}

func (h *brandHandler) GetBrandByID(c *fiber.Ctx) error {

	brandID := c.Params("brandID")

	brand, err := h.brandService.FindBrandByID(brandID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(brand)
}

func (h *brandHandler) GetAllBrands(c *fiber.Ctx) error {

	brands, err := h.brandService.ListBrands()
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusOK).JSON(brands)
}

func (h *brandHandler) UpdateBrand(c *fiber.Ctx) error {

	var req dto.ReqBrand

	brandID := c.Params("brandID")

	err := c.BodyParser(&req)
	if err != nil {
		return errs.BadRequest("invalid request body", err)
	}
	req.Name = strings.TrimSpace(req.Name)
	if err := h.validator.Struct(req); err != nil {
		return errs.BadRequest("brand name is required", err)
	}

	err = h.brandService.UpdateBrand(brandID, req)
	if err != nil {
		return err
	}

	msg := fmt.Sprintf("update brand %v successfully", req.Name)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": msg})
}

func (h *brandHandler) DeleteBrand(c *fiber.Ctx) error {

	brandID := c.Params("brandID")

	err := h.brandService.DeleteBrand(brandID)
	if err != nil {
		return err
	}

	return c.SendStatus(fiber.StatusNoContent)
}
