package http

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/service"
)

type OrderHandler interface {
	CreateOrder(c *fiber.Ctx) error
	GetMyOrders(c *fiber.Ctx) error
	GetOrderDetail(c *fiber.Ctx) error
	UpdateOrderAddress(c *fiber.Ctx) error
	AdminGetAllOrders(c *fiber.Ctx) error
	AdminUpdateOrderStatus(c *fiber.Ctx) error
	AdminUpdateTracking(c *fiber.Ctx) error
}

type orderHandler struct {
	orderService service.OrderService
	validator    *validator.Validate
}

func NewOrderHandler(orderService service.OrderService) OrderHandler {
	return &orderHandler{
		orderService: orderService,
		validator:    validator.New(),
	}
}

func (h *orderHandler) CreateOrder(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	var req dto.ReqCreateOrder
	err = c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	res, err := h.orderService.CreateOrder(userID, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "order created successfully",
		"data":    res,
	})
}

func (h *orderHandler) GetMyOrders(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	orders, err := h.orderService.GetUserOrders(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "orders retrieved successfully",
		"data":    orders,
	})
}

func (h *orderHandler) GetOrderDetail(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	isAdmin := IsAdminFromCtx(c)
	orderID := c.Params("orderID")

	order, err := h.orderService.GetOrderDetail(orderID, userID, isAdmin)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "order details retrieved successfully",
		"data":    order,
	})
}

func (h *orderHandler) UpdateOrderAddress(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	orderID := c.Params("orderID")
	var req dto.ReqUpdateOrderAddress
	err = c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	if err := h.validator.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	err = h.orderService.UpdateOrderAddress(orderID, userID, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "order shipping address updated successfully"})
}

func (h *orderHandler) AdminGetAllOrders(c *fiber.Ctx) error {
	orders, err := h.orderService.GetAllOrdersForAdmin()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "all orders retrieved successfully",
		"data":    orders,
	})
}

func (h *orderHandler) AdminUpdateOrderStatus(c *fiber.Ctx) error {
	orderID := c.Params("orderID")

	var req dto.ReqUpdateOrderStatus
	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	if err := h.validator.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	err = h.orderService.UpdateOrderStatus(orderID, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "order status updated successfully"})
}

func (h *orderHandler) AdminUpdateTracking(c *fiber.Ctx) error {
	orderID := c.Params("orderID")

	var req dto.ReqUpdateTracking
	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	if err := h.validator.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	err = h.orderService.UpdateTrackingNumber(orderID, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "tracking number updated successfully"})
}
