package http

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/service"
)

type AddressHandler interface {
	CreateAddress(c *fiber.Ctx) error
}

type addressHandler struct {
	addrressService service.AddressService
	validator       *validator.Validate
}

func NewAddressHandler(addrressService service.AddressService) AddressHandler {
	return &addressHandler{addrressService: addrressService}
}

func (h *addressHandler) CreateAddress(c *fiber.Ctx) error {

	userID, err := GetUserIDFromCtx(c)

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON("")
	}

	var req dto.ReqAddress

	err = c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid body"})
	}

	err = h.addrressService.CreateAddress(req, userID)
	if err != nil {
		return err
	}

	return c.JSON(fiber.Map{"message": "address created"})
}
