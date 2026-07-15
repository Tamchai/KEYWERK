package handlers

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/services"
	"github.com/gofiber/fiber/v2"
)

type UserHandler interface {
	Register(c *fiber.Ctx) error
	Login(c *fiber.Ctx) error
}

type userHandler struct {
	userService services.UserService
}

func NewUserHandler(userService services.UserService) UserHandler {
	return &userHandler{userService: userService}
}

func (h *userHandler) Register(c *fiber.Ctx) error {
	var req core.RegisterReq

	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid information"})
	}

	if req.Email == "" || req.Name == "" || req.Password == "" {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{"message": "required name email and password "})
	}

	err = h.userService.Register(req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON("internal server error")
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "register successful"})
}

func (h *userHandler) Login(c *fiber.Ctx) error {

	var req core.LoginReq

	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{"message": "invalid information"})
	}

	if req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "required email and password"})
	}

	token, err := h.userService.Login(req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "login unsuccess"})
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "login success",
		"email":   req.Email,
		"token":   token,
	})
}
