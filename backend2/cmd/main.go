package main

import (
	"fmt"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/keywerk/cmd/router"
	"github.com/keywerk/internal/infrastructure"
	"github.com/spf13/viper"
)

func main() {
	err := InitConfig()
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	app := fiber.New(fiber.Config{
		AppName: "KEYWERK API v1",
	})

	// Global Middlewares
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, HEAD, PUT, DELETE, PATCH, OPTIONS",
		AllowCredentials: false,
	}))

	infrastructure.InitNeon()

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

func InitConfig() error {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("../")
	viper.AutomaticEnv()
	viper.EnvKeyReplacer(strings.NewReplacer(".", "_"))

	if err := viper.ReadInConfig(); err != nil {
		return err
	}
	return nil
}
