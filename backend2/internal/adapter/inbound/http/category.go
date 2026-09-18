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

type CategoryHandler interface {
	ListCategories(c *fiber.Ctx) error
	FindCategoryByID(c *fiber.Ctx) error
	UpdateCategory(c *fiber.Ctx) error
	SaveCategory(c *fiber.Ctx) error
	DeleteCategory(c *fiber.Ctx) error
}

type categoryHandler struct {
	categoryService service.CategoryService
	validator       *validator.Validate
}

func NewCategoryHandler(categoryService service.CategoryService) CategoryHandler {
	return &categoryHandler{categoryService: categoryService, validator: validator.New()}
}

func (h *categoryHandler) ListCategories(c *fiber.Ctx) error {

	categories, err := h.categoryService.ListCategories()
	if err != nil {
		return errs.Internal("failed to fetch categories", err)
	}

	return c.Status(fiber.StatusOK).JSON(categories)
}

func (h *categoryHandler) FindCategoryByID(c *fiber.Ctx) error {

	id := c.Params("categoryID")

	category, err := h.categoryService.FindCategoryByID(id)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(category)
}

func (h *categoryHandler) UpdateCategory(c *fiber.Ctx) error {
	id := c.Params("categoryID")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid category id"})
	}

	var req dto.ReqCategory

	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest("invalid request body", err)
	}
	req.Name = strings.TrimSpace(req.Name)
	if err := h.validator.Struct(req); err != nil {
		return errs.BadRequest("category name is required", err)
	}

	err := h.categoryService.UpdateCategory(id, req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "updated successfully"})
}

func (h *categoryHandler) SaveCategory(c *fiber.Ctx) error {
	var req dto.ReqCategory

	err := c.BodyParser(&req)
	if err != nil {
		return errs.BadRequest("invalid request body", err)
	}
	req.Name = strings.TrimSpace(req.Name)
	if err := h.validator.Struct(req); err != nil {
		return errs.BadRequest("category name is required", err)
	}

	err = h.categoryService.SaveCategory(req)
	if err != nil {
		return err
	}

	msg := fmt.Sprintf("created %s", req.Name)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": msg})
}

func (h *categoryHandler) DeleteCategory(c *fiber.Ctx) error {
	id := c.Params("categoryID")

	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid category id"})
	}

	err := h.categoryService.DeleteCategory(id)
	if err != nil {
		return err
	}

	return c.SendStatus(fiber.StatusNoContent)
}
