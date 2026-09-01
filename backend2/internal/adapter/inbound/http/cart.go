package http

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/service"
)

type CartHandler interface {
	GetCart(c *fiber.Ctx) error
	AddToCart(c *fiber.Ctx) error
	UpdateCartItem(c *fiber.Ctx) error
	RemoveCartItem(c *fiber.Ctx) error
	ClearCart(c *fiber.Ctx) error
}

type cartHandler struct {
	cartService service.CartService
	validator   *validator.Validate
}

func NewCartHandler(cartService service.CartService) CartHandler {
	return &cartHandler{
		cartService: cartService,
		validator:   validator.New(),
	}
}

func (h *cartHandler) GetCart(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	cart, err := h.cartService.GetCart(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(cart)
}

func (h *cartHandler) AddToCart(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	var req dto.ReqAddToCart
	err = c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	if err := h.validator.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	err = h.cartService.AddToCart(userID, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "item added to cart successfully"})
}

func (h *cartHandler) UpdateCartItem(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	cartItemID := c.Params("cartItemID")
	var req dto.ReqUpdateCartItem
	err = c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	if err := h.validator.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	err = h.cartService.UpdateCartItem(userID, cartItemID, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "cart item updated successfully"})
}

func (h *cartHandler) RemoveCartItem(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	cartItemID := c.Params("cartItemID")
	err = h.cartService.RemoveCartItem(userID, cartItemID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "cart item removed successfully"})
}

func (h *cartHandler) ClearCart(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	err = h.cartService.ClearCart(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "cart cleared successfully"})
}
