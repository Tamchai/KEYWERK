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

	productVariant := route.Group("/product-variants", middleware.AuthMiddleware())

	productVariant.Get("/:variantID", productVariantHandler.FingProductVariantByID)
	productVariant.Post("/", middleware.CheckAdminRole(), productVariantHandler.CreateProductVariant)
	productVariant.Delete("/:variantID", middleware.CheckAdminRole(), productVariantHandler.DeleteProductVariant)

}
