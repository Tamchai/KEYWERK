package http

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/service"
)

type PaymentHandler interface {
	CreatePayment(c *fiber.Ctx) error
	GetPaymentStatus(c *fiber.Ctx) error
	AdminGetAllPayments(c *fiber.Ctx) error
	AdminVerifyPayment(c *fiber.Ctx) error
}

type paymentHandler struct {
	paymentService service.PaymentService
	validator      *validator.Validate
}

func NewPaymentHandler(paymentService service.PaymentService) PaymentHandler {
	return &paymentHandler{
		paymentService: paymentService,
		validator:      validator.New(),
	}
}

func (h *paymentHandler) CreatePayment(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	var req dto.ReqCreatePayment
	err = c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	if err := h.validator.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	res, err := h.paymentService.CreatePayment(userID, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "payment created successfully",
		"data":    res,
	})
}

func (h *paymentHandler) GetPaymentStatus(c *fiber.Ctx) error {
	userID, err := GetUserIDFromCtx(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	isAdmin := IsAdminFromCtx(c)
	orderID := c.Params("orderID")

	res, err := h.paymentService.GetPaymentByOrderID(orderID, userID, isAdmin)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "payment status retrieved successfully",
		"data":    res,
	})
}

func (h *paymentHandler) AdminGetAllPayments(c *fiber.Ctx) error {
	payments, err := h.paymentService.GetAllPaymentsForAdmin()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "all payments retrieved successfully",
		"data":    payments,
	})
}

func (h *paymentHandler) AdminVerifyPayment(c *fiber.Ctx) error {
	paymentID := c.Params("paymentID")

	var req dto.ReqVerifyPayment
	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid request body"})
	}

	if err := h.validator.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	err = h.paymentService.VerifyPayment(paymentID, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "payment verification status updated successfully"})
}
