package handlers

import (
	"fmt"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/services"
	"github.com/MaKo114/KEYWERK/utils"
	"github.com/gofiber/fiber/v2"
)

type PaymentHandler interface {
	Paid(c *fiber.Ctx) error
}

type paymentHandler struct {
	paymentService services.PaymentService
}

func NewPaymentHandler(paymentService services.PaymentService) PaymentHandler {
	return &paymentHandler{paymentService: paymentService}
}

func (h *paymentHandler) Paid(c *fiber.Ctx) error {

	userID, err := utils.GetUserID(c)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"message": "unauthorized"})
	}

	var ReqPayment core.ReqPayment

	err = c.BodyParser(&ReqPayment)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "invalid body"})
	}

	err = h.paymentService.UpdateStatus(userID, ReqPayment.PaymentID)
	if err != nil {
		fmt.Println(err)
		return c.Status(500).JSON(fiber.Map{"message": err})
	}

	return c.Status(200).JSON(fiber.Map{"message": "paid"})
}
