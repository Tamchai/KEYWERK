package main

import (
	"errors"
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/keywerk/cmd/router"
	"github.com/keywerk/internal/core/domain/errs"
	"github.com/keywerk/internal/infrastructure"
	"github.com/spf13/viper"
)

func main() {
	err := infrastructure.InitConfig()
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	app := fiber.New(fiber.Config{
		AppName:      "KEYWERK API v1",
		ErrorHandler: apiErrorHandler,
	})

	// Global Middlewares
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     viper.GetString("app.cors.allow_origins"),
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, HEAD, PUT, DELETE, PATCH, OPTIONS",
		AllowCredentials: false,
	}))

	if err := infrastructure.InitNeon(); err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer func() {
		if err := infrastructure.CloseNeon(); err != nil {
			log.Printf("Database close failed: %v", err)
		}
	}()

	router.SetupApiRoutes(app)

	port := viper.GetInt("app.port")
	if port == 0 {
		port = 8000
	}

	addr := fmt.Sprintf(":%d", port)
	log.Printf("🚀 KEYWERK Server running on http://localhost%s", addr)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

func apiErrorHandler(c *fiber.Ctx, err error) error {
	var appErr *errs.AppError
	if errors.As(err, &appErr) {
		if appErr.Code >= fiber.StatusInternalServerError {
			log.Printf("request failed: %v", appErr.Err)
		}
		return c.Status(appErr.Code).JSON(fiber.Map{"message": appErr.Message})
	}

	var fiberErr *fiber.Error
	if errors.As(err, &fiberErr) {
		return c.Status(fiberErr.Code).JSON(fiber.Map{"message": fiberErr.Message})
	}

	log.Printf("unhandled request error: %v", err)
	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "internal server error"})
}
