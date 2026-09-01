package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/adapter/inbound/http"
	"github.com/keywerk/internal/adapter/outbound/neon"
	"github.com/keywerk/internal/core/domain/service"
	"github.com/keywerk/internal/infrastructure"
	"github.com/keywerk/internal/middleware"
)

func SetupCartRoutes(router fiber.Router) {
	cartRepo := neon.NewNeonCartRepository(infrastructure.DB)
	productVariantRepo := neon.NewNeonProductVariantRepository(infrastructure.DB)
	cartService := service.NewCartService(cartRepo, productVariantRepo)
	cartHandler := http.NewCartHandler(cartService)

	cart := router.Group("/cart", middleware.AuthMiddleware())

	cart.Get("/", cartHandler.GetCart)
	cart.Post("/items", cartHandler.AddToCart)
	cart.Put("/items/:cartItemID", cartHandler.UpdateCartItem)
	cart.Delete("/items/:cartItemID", cartHandler.RemoveCartItem)
	cart.Delete("/", cartHandler.ClearCart)
}
