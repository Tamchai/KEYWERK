package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/adapter/inbound/http"
	"github.com/keywerk/internal/adapter/outbound/neon"
	"github.com/keywerk/internal/core/domain/service"
	"github.com/keywerk/internal/infrastructure"
	"github.com/keywerk/internal/middleware"
)

func SetupBrandRoutes(router fiber.Router) {

	brandRepo := neon.NewNeonBrandRepository(infrastructure.DB)
	brandService := service.NewBrandSerivce(brandRepo)
	brandHandler := http.NewBrandHandler(brandService)

	brand := router.Group("/brands", middleware.AuthMiddleware())

	brand.Get("/", brandHandler.GetAllBrands)
	brand.Get("/:brandID", brandHandler.GetBrandByID)
	brand.Post("/", middleware.CheckAdminRole(), brandHandler.CreateBrand)
	brand.Patch("/:brandID", middleware.CheckAdminRole(), brandHandler.UpdateBrand)
	brand.Delete("/:brandID", middleware.CheckAdminRole(), brandHandler.DeleteBrand)

}
