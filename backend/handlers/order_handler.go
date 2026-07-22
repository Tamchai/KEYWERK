package handlers

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/services"
	"github.com/MaKo114/KEYWERK/utils"
	"github.com/gofiber/fiber/v2"
)

type OrderHandler interface {
	Checkout(c *fiber.Ctx) error
	// GetUserOrders(c *fiber.Ctx) error
}

type orderHandler struct {
	orderService services.OrderService
}

// NewOrderHandler Inject OrderService เข้ามาใช้งาน
func NewOrderHandler(orderService services.OrderService) OrderHandler {
	return &orderHandler{
		orderService: orderService,
	}
}

// Checkout รับ Request กดสั่งซื้อสินค้าจากหน้าบ้าน
func (h *orderHandler) Checkout(c *fiber.Ctx) error {
	// 1. ดึง userID จาก JWT Token / Middleware context
	userID, err := utils.GetUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Unauthorized: user ID missing",
		})
	}

	// 2. Body Parser รับ Request JSON จากหน้าบ้าน
	var req core.CheckoutRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request body: " + err.Error(),
		})
	}

	// 3. Validate Request
	if req.ShippingMethod == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "ShippingMethod is required",
		})
	}

	// 4. สั่งงาน Service ให้ประมวลผล Checkout
	err = h.orderService.Checkout(userID, req)
	if err != nil {
		// ดัก Error message ต่างๆ จาก Service
		switch err.Error() {
		case "cart is empty", "cart not found":
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status":  "error",
				"message": err.Error(),
			})
		case "stock not enough":
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"status":  "error",
				"message": "Insufficient stock for one or more items",
			})
		default:
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status":  "error",
				"message": "Failed to checkout: " + err.Error(),
			})
		}
	}

	// 5. ตอบกลับเมื่อสั่งซื้อสำเร็จ (HTTP 201 Created)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Order created successfully",
	})
}

// Response เมื่อ Checkout สำเร็จ
// return c.Status(fiber.StatusCreated).JSON(fiber.Map{
//     "status":  "success",
//     "message": "Order created successfully",
//     "data": fiber.Map{
//         "payment_id": newPayment.ID, // 👈 ส่ง PaymentID ตัวนี้ให้หน้าบ้านเอาไปใช้จ่ายเงิน
//         "order_id":   newOrder.OrderID,
//         "amount":     newOrder.TotalPrice,
//     },
// })

// GetUserOrders ดึงประวัติคำสั่งซื้อทั้งหมดของ User
// func (h *orderHandler) GetUserOrders(c *fiber.Ctx) error {
// 	userID, ok := c.Locals("user_id").(string)
// 	if !ok || userID == "" {
// 		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
// 			"status":  "error",
// 			"message": "Unauthorized: user ID missing",
// 		})
// 	}

// 	orders, err := h.orderService.GetOrdersByUserID(userID)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
// 			"status":  "error",
// 			"message": "Failed to retrieve orders: " + err.Error(),
// 		})
// 	}

// 	return c.Status(fiber.StatusOK).JSON(fiber.Map{
// 		"status": "success",
// 		"data":   orders,
// 	})
// }
