package router

import "github.com/gofiber/fiber/v2"

func SetupV1Routes(app fiber.Router) {
	v1 := app.Group("/v1")

	SetupUserRoutes(v1)
	SetupAddressRoutes(v1)
	SetupBrandRoutes(v1)
	SetupCategoryRoutes(v1)
	SetupProductRoutes(v1)
	SetupProductVariantRoutes(v1)
	SetupImageRoutes(v1)
}
