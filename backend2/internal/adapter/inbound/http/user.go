package http

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/service"
)

type UserHandler interface {
	Login(c *fiber.Ctx) error
	Register(c *fiber.Ctx) error
}

type userHandler struct {
	userService service.UserService
	validator   *validator.Validate
}

func NewUserHandler(userService service.UserService) UserHandler {
	return &userHandler{userService: userService, validator: validator.New()}
}

func (h *userHandler) Login(c *fiber.Ctx) error {
	var req dto.ReqLogin

	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{"message": "invalid information"})
	}

	err = h.validator.Struct(req)
	if err != nil {
		for _, e := range err.(validator.ValidationErrors) {
			return c.Status(400).JSON(fiber.Map{"error": "Validation error on field: " + e.StructField() + " - " + e.Tag()})
		}
	}

	token, err := h.userService.Login(req)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "login success",
		"email":   req.Email,
		"token":   token,
	})
}

func (h *userHandler) Register(c *fiber.Ctx) error {

	var body dto.ReqRegister

	err := c.BodyParser(&body)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "invalid body"})
	}

	// ตรวจสอบ field ว่าส่งมาครบไหม
	if err := h.validator.Struct(body); err != nil {
		for _, e := range err.(validator.ValidationErrors) {
			return c.Status(400).JSON(fiber.Map{"error": "Validation error on field: " + e.StructField() + " - " + e.Tag()})
		}
	}

	if body.Password != body.ConfirmPassword {
		return c.Status(400).JSON(fiber.Map{"message": "password invalid"})
	}

	err = h.userService.Register(body)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": ""})
	}

	return c.JSON(fiber.Map{"message": "register successfully"})
}
