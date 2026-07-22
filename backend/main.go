package main

import (
	"fmt"
	"log"
	"os"

	"github.com/MaKo114/KEYWERK/adapters"
	"github.com/MaKo114/KEYWERK/handlers"
	"github.com/MaKo114/KEYWERK/middlewares"
	"github.com/MaKo114/KEYWERK/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	db := initDB()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowMethods: "*",
		AllowOrigins: "http://localhost:5173",
	}))

	userRepo := adapters.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	categoryRepo := adapters.NewCategoryRepository(db)
	categoryService := services.NewCategoryService(categoryRepo)
	categoryHandler := handlers.NewCategoryHandler(categoryService)

	brandRepo := adapters.NewBrandRepository(db)
	brandService := services.NewBrandService(brandRepo)
	brandHandler := handlers.NewBrandHandler(brandService)

	productRepo := adapters.NewProductRepository(db)
	productService := services.NewProductService(productRepo)
	productHandler := handlers.NewProductHandler(productService)

	pvRepo := adapters.NewProductVariantRepository(db)
	pvService := services.NewProductVariantService(pvRepo)
	pvHandler := handlers.NewProductVariantHandler(pvService)

	addressRepo := adapters.NewAddressRepository(db)
	addressService := services.NewAddressService(addressRepo)
	addressHandler := handlers.NewAddressHandler(addressService)

	cartItemRepo := adapters.NewCartItemRepository(db)

	cartRepo := adapters.NewCartRepository(db)
	cartService := services.NewCartService(cartRepo, cartItemRepo)
	cartHandler := handlers.NewCartHandler(cartService)

	paymentRepo := adapters.NewPaymentRepository(db)

	orderItemRepo := adapters.NewOrderItemRepository(db)

	orderRepo := adapters.NewOrderRepository(db)
	orderService := services.NewOrderService(db, paymentRepo, addressRepo, pvRepo, cartRepo, cartItemRepo, orderRepo, orderItemRepo)
	orderHandler := handlers.NewOrderHandler(orderService)

	paymentService := services.NewPaymentService(db, paymentRepo, orderRepo)
	paymentHandler := handlers.NewPaymentHandler(paymentService)

	app.Post("/register", userHandler.Register)
	app.Post("/login", userHandler.Login)

	categoryRoute := app.Group("/categories")
	categoryRoute.Get("/", categoryHandler.GetCategories)
	categoryRoute.Post("/", middlewares.AuthMiddleware(), middlewares.CheckAdminRole(), categoryHandler.SaveCategory)
	categoryRoute.Put("/:category_id", middlewares.AuthMiddleware(), middlewares.CheckAdminRole(), categoryHandler.UpdateCategory)
	categoryRoute.Delete("/:category_id", middlewares.AuthMiddleware(), middlewares.CheckAdminRole(), categoryHandler.DeleteCategory)

	brandRoute := app.Group("/brands")
	brandRoute.Get("/", brandHandler.GetAllBrands)
	brandRoute.Get("/:id", brandHandler.GetBrandByID)
	brandRoute.Post("/", middlewares.AuthMiddleware(), middlewares.CheckAdminRole(), brandHandler.CreateBrand)
	brandRoute.Put("/:id", middlewares.AuthMiddleware(), middlewares.CheckAdminRole(), brandHandler.UpdateBrand)
	brandRoute.Delete("/:id", middlewares.AuthMiddleware(), middlewares.CheckAdminRole(), brandHandler.DeleteBrand)

	productRoute := app.Group("/products")
	productRoute.Get("/", productHandler.GetAllProducts)
	productRoute.Get(":productId/variants", pvHandler.GetVariantsByProductID)

	pvRoute := app.Group("/variants")
	pvRoute.Get("/:id", pvHandler.GetVariantByID)
	// pvRoute.Get("/:productId", pvHandler.GetVariantsByProductID)
	pvRoute.Post("/", middlewares.AuthMiddleware(), middlewares.CheckAdminRole(), pvHandler.CreateVariant)

	addressRoute := app.Group("/address")
	addressRoute.Post("/", middlewares.AuthMiddleware(), addressHandler.SaveAddress)
	addressRoute.Get("/", middlewares.AuthMiddleware(), addressHandler.GetAddresses)
	addressRoute.Put("/:address_id", middlewares.AuthMiddleware(), addressHandler.UpdateAddress)
	addressRoute.Delete("/:address_id", middlewares.AuthMiddleware(), addressHandler.DeleteAddress)

	cartRoute := app.Group("/carts")
	cartRoute.Post("/", middlewares.AuthMiddleware(), cartHandler.AddItemToCart)
	cartRoute.Get("/", middlewares.AuthMiddleware(), cartHandler.GetItems)
	cartRoute.Delete("/", middlewares.AuthMiddleware(), cartHandler.DeleteItemToCart)

	orderRoute := app.Group("/orders", middlewares.AuthMiddleware())
	orderRoute.Post("/", orderHandler.Checkout)

	paymentRoute := app.Group("/payments", middlewares.AuthMiddleware())
	paymentRoute.Post("/", paymentHandler.Paid)

	app.Listen(":8000")

}

func initDB() *sqlx.DB {

	db, err := sqlx.Open("postgres", os.Getenv("DSN"))

	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("connect neon success")

	return db
}
