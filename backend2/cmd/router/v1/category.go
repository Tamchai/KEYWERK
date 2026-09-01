package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/adapter/inbound/http"
	"github.com/keywerk/internal/adapter/outbound/neon"
	"github.com/keywerk/internal/core/domain/service"
	"github.com/keywerk/internal/infrastructure"
	"github.com/keywerk/internal/middleware"
)

func SetupCategoryRoutes(route fiber.Router) {
	categoryRepo := neon.NewNeonCategoryRepository(infrastructure.DB)
	categoryService := service.NewCategoryService(categoryRepo)
	categoryHandler := http.NewCategoryHandler(categoryService)

	category := route.Group("/categories")

	// Public routes
	category.Get("/", categoryHandler.ListCategories)
	category.Get("/:categoryID", categoryHandler.FindCategoryByID)

	// Admin protected routes
	category.Post("/", middleware.AuthMiddleware(), middleware.CheckAdminRole(), categoryHandler.SaveCategory)
	category.Patch("/:categoryID", middleware.AuthMiddleware(), middleware.CheckAdminRole(), categoryHandler.UpdateCategory)
	category.Delete("/:categoryID", middleware.AuthMiddleware(), middleware.CheckAdminRole(), categoryHandler.DeleteCategory)
}
