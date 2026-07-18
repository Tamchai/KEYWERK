package handlers

import (
	"fmt"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/services"
	"github.com/gofiber/fiber/v2"
)

type CategorHandler interface {
	GetCategories(c *fiber.Ctx) error
	UpdateCategory(c *fiber.Ctx) error
	SaveCategory(c *fiber.Ctx) error
	DeleteCategory(c *fiber.Ctx) error
}

type categoryHandler struct {
	categoryService services.CategoryService
}

func NewCategoryHandler(categoryService services.CategoryService) CategorHandler {
	return &categoryHandler{categoryService: categoryService}
}

func (h *categoryHandler) GetCategories(c *fiber.Ctx) error {
	categories, err := h.categoryService.GetAll()

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "not found categories"})
	}

	return c.Status(fiber.StatusOK).JSON(categories)
}

func (h *categoryHandler) UpdateCategory(c *fiber.Ctx) error {

	id := c.Params("category_id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid category id"})
	}

	var req core.ReqCategory

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request"})
	}

	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "category name cannot be empty"})
	}

	err := h.categoryService.UpdateCategory(id, req)
	if err != nil {

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "cannot update category"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "updated successfully"})
}

func (h *categoryHandler) SaveCategory(c *fiber.Ctx) error {
	var req core.ReqCategory

	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request"})
	}
	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request"})
	}

	err = h.categoryService.SaveCategory(req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "cannot insert category"})
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

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "deleted successfully"})
}
