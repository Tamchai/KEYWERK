package http

import (
	"fmt"
	"log"

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
}

func NewBrandHandler(brandService service.BrandService) BrandHandler {
	return &brandHandler{brandService: brandService}
}

func (h *brandHandler) CreateBrand(c *fiber.Ctx) error {

	var req dto.ReqBrand

	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid body"})
	}

	err = h.brandService.CreateBrand(req)
	if err != nil {
		return errs.Internal("can't create brand", err)
	}

	msg := fmt.Sprintf("created brand %v successfully", req.Name)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": msg})
}

func (h *brandHandler) GetBrandByID(c *fiber.Ctx) error {

	brandID := c.Params("brandID")

	brand, err := h.brandService.FindBrandByID(brandID)
	if err != nil {

		if appErr, ok := err.(*errs.AppError); ok {
			if appErr.Code == fiber.StatusInternalServerError {
				log.Printf("[ERROR] %v", appErr.Unwrap())
			}

			return c.Status(appErr.Code).JSON(fiber.Map{
				"message": appErr.Message,
			})
		}

		log.Printf("[ERROR] %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to fetch brand",
		})
	}

	return c.Status(fiber.StatusOK).JSON(brand)
}

func (h *brandHandler) GetAllBrands(c *fiber.Ctx) error {

	brands, err := h.brandService.ListBrands()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "can't find brands"})
	}
	return c.Status(fiber.StatusOK).JSON(brands)
}

func (h *brandHandler) UpdateBrand(c *fiber.Ctx) error {

	var req dto.ReqBrand

	brandID := c.Params("brandID")

	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid body"})
	}

	err = h.brandService.UpdateBrand(brandID, req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "can't update brand"})
	}

	msg := fmt.Sprintf("update brand %v successfully", req.Name)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": msg})
}

func (h *brandHandler) DeleteBrand(c *fiber.Ctx) error {

	brandID := c.Params("brandID")

	err := h.brandService.DeleteBrand(brandID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "can't delete"})
	}

	msg := fmt.Sprintf("deleted %v", brandID)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": msg})
}
