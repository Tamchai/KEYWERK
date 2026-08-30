package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/adapter/inbound/http"
	"github.com/keywerk/internal/adapter/outbound/neon"
	"github.com/keywerk/internal/core/domain/service"
	"github.com/keywerk/internal/infrastructure"
)

func SetupUserRoutes(router fiber.Router) {
	userRepo := neon.NewNeonUserRepository(infrastructure.DB)
	userService := service.NewUserService(userRepo)
	userHandler := http.NewUserHandler(userService)

	// localhost:8000/api/v1/
	user := router

	user.Post("/login", userHandler.Login)
	user.Post("/register", userHandler.Register)

}
