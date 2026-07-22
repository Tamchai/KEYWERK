package utils

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func GetUserID(c *fiber.Ctx) (string, error) {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID, ok := claims["user_id"].(string)
	if !ok {
		return "", fiber.NewError(fiber.StatusUnauthorized, "unauthorized")
	}
	return userID, nil
}
