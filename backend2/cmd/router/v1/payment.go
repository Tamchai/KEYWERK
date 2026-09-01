package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/adapter/inbound/http"
	"github.com/keywerk/internal/adapter/outbound/neon"
	"github.com/keywerk/internal/core/domain/service"
	"github.com/keywerk/internal/infrastructure"
	"github.com/keywerk/internal/middleware"
)

func SetupPaymentRoutes(router fiber.Router) {
	paymentRepo := neon.NewNeonPaymentRepository(infrastructure.DB)
	orderRepo := neon.NewNeonOrderRepository(infrastructure.DB)
	paymentService := service.NewPaymentService(paymentRepo, orderRepo)
	paymentHandler := http.NewPaymentHandler(paymentService)

	payment := router.Group("/payments", middleware.AuthMiddleware())

	// Customer routes
	payment.Post("/", paymentHandler.CreatePayment)
	payment.Get("/order/:orderID", paymentHandler.GetPaymentStatus)

	// Admin routes
	adminPayment := router.Group("/admin/payments", middleware.AuthMiddleware(), middleware.CheckAdminRole())
	adminPayment.Get("/", paymentHandler.AdminGetAllPayments)
	adminPayment.Put("/:paymentID/verify", paymentHandler.AdminVerifyPayment)
}
