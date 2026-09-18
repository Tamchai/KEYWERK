package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/cmd/router/v1"
)

func SetupApiRoutes(app *fiber.App) {
	api := app.Group("/api")
	router.SetupV1Routes(api)
}
