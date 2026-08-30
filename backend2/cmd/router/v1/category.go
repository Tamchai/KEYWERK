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

	category := route.Group("/categories", middleware.AuthMiddleware())

	category.Get("/:categoryID", categoryHandler.FindCategoryByID)
	category.Get("/", categoryHandler.ListCategories)
	category.Post("/", middleware.CheckAdminRole(), categoryHandler.SaveCategory)
	category.Patch("/:categoryID", middleware.CheckAdminRole(), categoryHandler.UpdateCategory)
	category.Delete("/:categoryID", middleware.CheckAdminRole(), categoryHandler.DeleteCategory)

}
