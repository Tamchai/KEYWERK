package router

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/adapter/inbound/http"
	"github.com/keywerk/internal/adapter/inbound/s3"
	"github.com/keywerk/internal/adapter/outbound/seaweedfs"
	"github.com/keywerk/internal/core/domain/service"
	"github.com/keywerk/internal/infrastructure"
	"github.com/keywerk/internal/middleware"
	"github.com/spf13/viper"
)

func SetupImageRoutes(route fiber.Router) {

	s3Client, err := s3.NewS3Client(
		viper.GetString("seaweedfs.url"),
		viper.GetString("seaweedfs.access_key"),
		viper.GetString("seaweedfs.secret_key"),
		viper.GetString("seaweedfs.region"),
	)
	if err != nil {
		log.Fatal(err)
	}

	productBucket := viper.GetString("seaweedfs.bucket")
	profileBucket := viper.GetString("seaweedfs.profile_bucket")
	if err := s3.EnsureBucket(s3Client, productBucket); err != nil {
		log.Fatal(err)
	}
	if err := s3.EnsureBucket(s3Client, profileBucket); err != nil {
		log.Fatal(err)
	}

	productImageRepo := seaweedfs.NewImageRepository(s3Client, productBucket, infrastructure.DB)
	productImageHandler := http.NewImageHandler(service.NewImageService(productImageRepo))
	profileImageRepo := seaweedfs.NewImageRepository(s3Client, profileBucket, infrastructure.DB)
	profileImageHandler := http.NewImageHandler(service.NewImageService(profileImageRepo))

	image := route.Group("/upload", middleware.AuthMiddleware(), middleware.CheckAdminRole())

	image.Post("/", productImageHandler.UploadImage)

	profileImage := route.Group("/profile/image", middleware.AuthMiddleware())
	profileImage.Post("/", profileImageHandler.UploadProfileImage)

}
