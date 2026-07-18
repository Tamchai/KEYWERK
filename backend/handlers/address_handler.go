package handlers

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/services"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type AddressHandler interface {
	SaveAddress(c *fiber.Ctx) error
	GetAddresses(c *fiber.Ctx) error
	UpdateAddress(c *fiber.Ctx) error
	DeleteAddress(c *fiber.Ctx) error
}

type addressHandler struct {
	addressService services.AddressService
}

func NewAddressHandler(addressService services.AddressService) AddressHandler {
	return &addressHandler{addressService: addressService}
}

func (h *addressHandler) getUserID(c *fiber.Ctx) (string, error) {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID, ok := claims["user_id"].(string)
	if !ok {
		return "", fiber.NewError(fiber.StatusUnauthorized, "unauthorized")
	}
	return userID, nil
}

func (h *addressHandler) SaveAddress(c *fiber.Ctx) error {
	userID, err := h.getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	var req core.ReqAddress
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "require body",
		})
	}

	if err := h.addressService.SaveAddress(&req, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "create address successful"})
}

func (h *addressHandler) GetAddresses(c *fiber.Ctx) error {
	userID, err := h.getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	addresses, err := h.addressService.GetAddressesByUserID(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(addresses)
}

func (h *addressHandler) UpdateAddress(c *fiber.Ctx) error {
	userID, err := h.getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	addressID := c.Params("address_id")
	if addressID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid address id"})
	}

	var req core.ReqAddress
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "require body"})
	}

	if err := h.addressService.UpdateAddress(addressID, &req, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "update address successful"})
}

func (h *addressHandler) DeleteAddress(c *fiber.Ctx) error {
	userID, err := h.getUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	addressID := c.Params("address_id")
	if addressID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid address id"})
	}

	if err := h.addressService.DeleteAddress(addressID, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "delete address successful"})
}
