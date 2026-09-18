package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/adapter/inbound/http"
	"github.com/keywerk/internal/adapter/outbound/neon"
	stripeadapter "github.com/keywerk/internal/adapter/outbound/stripe"
	"github.com/keywerk/internal/core/domain/service"
	"github.com/keywerk/internal/core/port/gateway"
	"github.com/keywerk/internal/infrastructure"
	"github.com/keywerk/internal/middleware"
	"github.com/spf13/viper"
)

func SetupPaymentRoutes(router fiber.Router) {
	paymentRepo := neon.NewNeonPaymentRepository(infrastructure.DB)
	orderRepo := neon.NewNeonOrderRepository(infrastructure.DB)
	var paymentGateway gateway.PaymentGateway
	if viper.GetBool("stripe.enabled") {
		paymentGateway = stripeadapter.NewPaymentGateway(viper.GetString("stripe.secret_key"), viper.GetString("stripe.webhook_secret"))
	}
	paymentService := service.NewPaymentService(paymentRepo, orderRepo, paymentGateway, viper.GetString("app.frontend_url"))
	paymentHandler := http.NewPaymentHandler(paymentService)

	// Stripe calls this route directly; authenticity is verified from the raw body signature.
	router.Post("/payments/stripe/webhook", paymentHandler.StripeWebhook)

	payment := router.Group("/payments", middleware.AuthMiddleware())

	// Customer routes
	payment.Post("/", paymentHandler.CreatePayment)
	payment.Get("/order/:orderID", paymentHandler.GetPaymentStatus)

	// Admin routes
	adminPayment := router.Group("/admin/payments", middleware.AuthMiddleware(), middleware.CheckAdminRole())
	adminPayment.Get("/", paymentHandler.AdminGetAllPayments)
	adminPayment.Put("/:paymentID/verify", paymentHandler.AdminVerifyPayment)
}
