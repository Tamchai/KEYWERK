package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/adapter/inbound/http"
	"github.com/keywerk/internal/adapter/outbound/neon"
	"github.com/keywerk/internal/core/domain/service"
	"github.com/keywerk/internal/infrastructure"
	"github.com/keywerk/internal/middleware"
)

func SetupOrderRoutes(router fiber.Router) {
	orderRepo := neon.NewNeonOrderRepository(infrastructure.DB)
	cartRepo := neon.NewNeonCartRepository(infrastructure.DB)
	addressRepo := neon.NewNeonAddressRepository(infrastructure.DB)
	productVariantRepo := neon.NewNeonProductVariantRepository(infrastructure.DB)
	productRepo := neon.NewNeonProductRepository(infrastructure.DB)
	paymentRepo := neon.NewNeonPaymentRepository(infrastructure.DB)

	orderService := service.NewOrderService(
		orderRepo,
		cartRepo,
		addressRepo,
		productVariantRepo,
		productRepo,
		paymentRepo,
	)
	orderHandler := http.NewOrderHandler(orderService)

	order := router.Group("/orders", middleware.AuthMiddleware())

	// Customer routes
	order.Post("/", orderHandler.CreateOrder)
	order.Get("/", orderHandler.GetMyOrders)
	order.Get("/:orderID", orderHandler.GetOrderDetail)
	order.Put("/:orderID/address", orderHandler.UpdateOrderAddress)

	// Admin routes
	adminOrder := router.Group("/admin/orders", middleware.AuthMiddleware(), middleware.CheckAdminRole())
	adminOrder.Get("/", orderHandler.AdminGetAllOrders)
	adminOrder.Put("/:orderID/status", orderHandler.AdminUpdateOrderStatus)
	adminOrder.Put("/:orderID/tracking", orderHandler.AdminUpdateTracking)
}
