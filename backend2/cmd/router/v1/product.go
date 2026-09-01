package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/adapter/inbound/http"
	"github.com/keywerk/internal/adapter/outbound/neon"
	"github.com/keywerk/internal/core/domain/service"
	"github.com/keywerk/internal/infrastructure"
	"github.com/keywerk/internal/middleware"
)

func SetupProductRoutes(route fiber.Router) {
	productRepo := neon.NewNeonProductRepository(infrastructure.DB)
	productService := service.NewProductService(productRepo)
	productHandler := http.NewProductHandler(productService)

	product := route.Group("/products")

	// Public routes
	product.Get("/", productHandler.ListProducts)
	product.Get("/:productID", productHandler.FindProductByID)

	// Admin protected routes
	product.Post("/", middleware.AuthMiddleware(), middleware.CheckAdminRole(), productHandler.CreateProduct)
	product.Put("/:productID", middleware.AuthMiddleware(), middleware.CheckAdminRole(), productHandler.UpdateProduct)
	product.Delete("/:productID", middleware.AuthMiddleware(), middleware.CheckAdminRole(), productHandler.DeleteProduct)
}
