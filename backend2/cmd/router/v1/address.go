package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/adapter/inbound/http"
	"github.com/keywerk/internal/adapter/outbound/neon"
	"github.com/keywerk/internal/core/domain/service"
	"github.com/keywerk/internal/infrastructure"
	"github.com/keywerk/internal/middleware"
)

func SetupAddressRoutes(router fiber.Router) {

	addressRepo := neon.NewNeonAddressRepository(infrastructure.DB)
	addressService := service.NewAddressService(addressRepo)
	addressHandler := http.NewAddressHandler(addressService)

	address := router.Group("/addresses", middleware.AuthMiddleware())

	address.Post("/", addressHandler.CreateAddress)
}
