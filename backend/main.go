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

	auth := app.Group("/payment", middlewares.AuthMiddleware())
	_ = auth

	userRepo := adapters.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	app.Post("/register", userHandler.Register)
	app.Post("/login", userHandler.Login)

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
