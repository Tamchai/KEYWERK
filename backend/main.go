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

	userRepo := adapters.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	categoryRepo := adapters.NewCategoryRepository(db)
	categoryService := services.NewCategoryService(categoryRepo)
	categoryHandler := handlers.NewCategoryHandler(categoryService)

	brandRepo := adapters.NewBrandRepository(db)
	brandService := services.NewBrandService(brandRepo)
	brandHandler := handlers.NewBrandHandler(brandService)

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
