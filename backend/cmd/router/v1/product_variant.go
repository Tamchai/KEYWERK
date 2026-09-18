package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/adapter/inbound/http"
	"github.com/keywerk/internal/adapter/outbound/neon"
	"github.com/keywerk/internal/core/domain/service"
	"github.com/keywerk/internal/infrastructure"
	"github.com/keywerk/internal/middleware"
)

func SetupProductVariantRoutes(route fiber.Router) {
	productVariantRepo := neon.NewNeonProductVariantRepository(infrastructure.DB)
	productVariantService := service.NewProductVariantService(productVariantRepo)
	productVariantHandler := http.NewProductVariantHandler(productVariantService)

	productVariant := route.Group("/product-variants")

	// Public routes
	productVariant.Get("/", productVariantHandler.GetAllProductVariants)
	productVariant.Get("/product/:productID", productVariantHandler.GetVariantsByProductID)
	productVariant.Get("/:variantID", productVariantHandler.FindProductVariantByID)

	// Admin protected routes
	productVariant.Post("/", middleware.AuthMiddleware(), middleware.CheckAdminRole(), productVariantHandler.CreateProductVariant)
	productVariant.Put("/:variantID", middleware.AuthMiddleware(), middleware.CheckAdminRole(), productVariantHandler.UpdateProductVariant)
	productVariant.Delete("/:variantID", middleware.AuthMiddleware(), middleware.CheckAdminRole(), productVariantHandler.DeleteProductVariant)
}
