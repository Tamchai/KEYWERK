package main

import (
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/cmd/router"
	"github.com/keywerk/internal/infrastructure"
	"github.com/spf13/viper"
)

func main() {

	app := fiber.New()

	err := InitConfig()
	if err != nil {
		log.Fatal(err)
	}

	infrastructure.InitNeon()

	router.SetupApiRoutes(app)

	if err := app.Listen(":8000"); err != nil {
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
