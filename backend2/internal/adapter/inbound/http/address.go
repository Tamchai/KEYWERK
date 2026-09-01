package http

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/service"
)

type AddressHandler interface {
	CreateAddress(c *fiber.Ctx) error
	GetAddresses(c *fiber.Ctx) error
	GetAddressByID(c *fiber.Ctx) error
	UpdateAddress(c *fiber.Ctx) error
	DeleteAddress(c *fiber.Ctx) error
}

type addressHandler struct {
	addressService service.AddressService
	validator      *validator.Validate
}

func NewAddressHandler(addressService service.AddressService) AddressHandler {
	return &addressHandler{
		addressService: addressService,
		validator:      validator.New(),
	}
}

func (h *addressHandler) CreateAddress(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	var req dto.ReqAddress
	err = c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	if err := h.validator.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	err = h.addressService.CreateAddress(req, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "address created successfully"})
}

func (h *addressHandler) GetAddresses(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	addresses, err := h.addressService.GetAddressesByUserID(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "addresses retrieved successfully",
		"data":    addresses,
	})
}

func (h *addressHandler) GetAddressByID(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	addrID := c.Params("addressID")
	addr, err := h.addressService.GetAddressByID(addrID, userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "address retrieved successfully",
		"data":    addr,
	})
}

func (h *addressHandler) UpdateAddress(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	addrID := c.Params("addressID")
	var req dto.ReqAddress
	err = c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	if err := h.validator.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	err = h.addressService.UpdateAddress(req, userID, addrID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "address updated successfully"})
}

func (h *addressHandler) DeleteAddress(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	addrID := c.Params("addressID")
	err = h.addressService.DeleteAddress(addrID, userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "address deleted successfully"})
}
