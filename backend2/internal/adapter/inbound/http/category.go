package http

import (
	"fmt"

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
}

func NewCategoryHandler(categoryService service.CategoryService) CategoryHandler {
	return &categoryHandler{categoryService: categoryService}
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
		return errs.Internal("not found category name", err)
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
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request"})
	}

	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "category name cannot be empty"})
	}

	err := h.categoryService.UpdateCategory(id, req)
	if err != nil {

		return errs.Internal("can't update category name", err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "updated successfully"})
}

func (h *categoryHandler) SaveCategory(c *fiber.Ctx) error {
	var req dto.ReqCategory

	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request"})
	}
	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request"})
	}

	err = h.categoryService.SaveCategory(req)
	if err != nil {
		return errs.Internal("can't insert category", err)
	}

	msg := fmt.Sprintf("created %s", req.Name)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": msg})
}

func (h *categoryHandler) DeleteCategory(c *fiber.Ctx) error {
	id := c.Params("category_id")

	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid category id"})
	}

	err := h.categoryService.DeleteCategory(id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "cannot delete category"})
	}

	msg := fmt.Sprintf("deleted %s successfully", id)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": msg})
}

// return status no content 204 dont return JSON
// return c.Status(fiber.StatusNoContent)
