package handlers

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/services"
	"github.com/MaKo114/KEYWERK/utils"
	"github.com/gofiber/fiber/v2"
)

type CartHandler interface {
	AddItemToCart(c *fiber.Ctx) error
	DeleteItemToCart(c *fiber.Ctx) error
	GetItems(c *fiber.Ctx) error
}

type cartHandler struct {
	cartService services.CartService
}

func NewCartHandler(cartService services.CartService) CartHandler {
	return &cartHandler{cartService: cartService}
}

func (h *cartHandler) AddItemToCart(c *fiber.Ctx) error {

	var req core.ReqCartItem
	userID, err := utils.GetUserID(c)

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	err = c.BodyParser(&req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"message": err})
	}

	err = h.cartService.AddItem(userID, req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": err})
	}

	return c.Status(200).JSON(fiber.Map{"message": "add item successful"})
}

func (h *cartHandler) DeleteItemToCart(c *fiber.Ctx) error {

	var req core.ReqDeleteCartItem
	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "body error"})
	}

	if req.CartID == "" || req.VariantID == "" {
		return c.Status(400).JSON(fiber.Map{"message": "body error"})
	}

	err = h.cartService.RemoveItemInCart(req.CartID, req.VariantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "cannot delete item"})
	}

	return c.Status(200).JSON(fiber.Map{"message": "delete item success"})
}

func (h *cartHandler) GetItems(c *fiber.Ctx) error {

	userID, err := utils.GetUserID(c)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"message": "unauthorized"})
	}

	items, err := h.cartService.GetItems(userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "not found"})
	}

	return c.Status(200).JSON(items)
}
