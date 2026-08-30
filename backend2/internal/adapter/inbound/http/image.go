package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/service"
)

type ImageHandler interface {
	UploadImage(c *fiber.Ctx) error
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

	files := fileHeader.File["file"]

	if len(files) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "No photos uploaded")
	}

	if len(files) > 5 {
		return fiber.NewError(fiber.StatusBadRequest, "Maximum 5 photos allowed")
	}

	imagesList := make([]dto.ReqImageData, 0, len(files))

	for _, f := range files {

		file, err := f.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "failed to open file"})
		}

		defer file.Close()

		imagesList = append(imagesList, dto.ReqImageData{
			FileName:    f.Filename,
			File:        file,
			ContentType: f.Header.Get("Content-Type"),
		})

	}

	res, err := h.imageService.UploadImage(c.Context(), imagesList)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
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
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": res}) // c.Status(fiber.StatusCreated).JSON(image)
}
