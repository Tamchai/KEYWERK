package http

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/service"
	"github.com/spf13/viper"
)

type ImageHandler interface {
	UploadImage(c *fiber.Ctx) error
	UploadProfileImage(c *fiber.Ctx) error
}

type imageHandler struct {
	imageService service.ImageService
}

func NewImageHandler(imageService service.ImageService) ImageHandler {
	return &imageHandler{imageService: imageService}
}

func (h *imageHandler) UploadImage(c *fiber.Ctx) error {
	// 1. รับไฟล์จาก Form Field ที่ชื่อว่า "file"
	// fileHeader, err := c.FormFile("file") // 1 file

	fileHeader, err := c.MultipartForm()

	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid form data")
	}

	files := fileHeader.File["images"]

	if len(files) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "no images uploaded")
	}

	maxImages := 5
	if value, ok := c.Locals("max_images").(int); ok {
		maxImages = value
	}
	if len(files) > maxImages {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("maximum %d images allowed", maxImages))
	}

	imagesList := make([]dto.ReqImageData, 0, len(files))

	for _, f := range files {
		contentType := strings.ToLower(f.Header.Get("Content-Type"))
		if contentType != "image/jpeg" && contentType != "image/png" && contentType != "image/webp" {
			return fiber.NewError(fiber.StatusBadRequest, "only JPEG, PNG, and WebP images are allowed")
		}
		if f.Size > 5*1024*1024 {
			return fiber.NewError(fiber.StatusBadRequest, "each image must be no larger than 5 MB")
		}

		file, err := f.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "failed to open file"})
		}

		defer file.Close()

		imagesList = append(imagesList, dto.ReqImageData{
			FileName:    f.Filename,
			File:        file,
			ContentType: contentType,
		})

	}

	timeout := time.Duration(viper.GetInt("seaweedfs.timeout_seconds")) * time.Second
	ctx, cancel := context.WithTimeout(c.UserContext(), timeout)
	defer cancel()
	res, err := h.imageService.UploadImage(ctx, imagesList)

	if err != nil {
		return err
	}

	// 2. เปิดอ่านไฟล์
	// file, err := fileHeader.Open()

	// fmt.Println("file: ", file)
	// if err != nil {
	// 	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
	// 		"message": "failed to open file",
	// 	})
	// }
	// defer file.Close()

	// 3. เรียกใช้ Service
	// contentType := fileHeader.Header.Get("Content-Type")
	// image, err := h.imageService.UploadImage(c.Context(), fileHeader.Filename, file, contentType)
	// if err != nil {
	// 	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
	// 		"message": err.Error(),
	// 	})
	// }

	// 4. ส่ง image_id และ image_url กลับออกไปให้ Frontend!
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *imageHandler) UploadProfileImage(c *fiber.Ctx) error {
	c.Locals("max_images", 1)
	return h.UploadImage(c)
}
