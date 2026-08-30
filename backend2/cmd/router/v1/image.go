package router

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/adapter/inbound/http"
	"github.com/keywerk/internal/adapter/inbound/s3"
	"github.com/keywerk/internal/adapter/outbound/seaweedfs"
	"github.com/keywerk/internal/core/domain/service"
	"github.com/keywerk/internal/infrastructure"
)

func SetupImageRoutes(route fiber.Router) {

	s3Client, err := s3.NewS3Client("http://localhost:8333", "keywerkadminmako", "secretkeywerkimage", "us-east-1")
	if err != nil {
		log.Fatal(err)
	}

	imageRepo := seaweedfs.NewImageRepository(s3Client, "products", infrastructure.DB)
	imageService := service.NewImageService(imageRepo)
	imageHandler := http.NewImageHandler(imageService)

	image := route.Group("/upload")

	image.Post("/", imageHandler.UploadImage)

}
