package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
)

func GetUserIDFromCtx(c *fiber.Ctx) (string, error) {
	user, ok := c.Locals("user").(*jwt.Token)
	if !ok || user == nil {
		return "", errs.Unauthorized("unauthorized", nil)
	}

	claims, ok := user.Claims.(jwt.MapClaims)
	if !ok {
		return "", errs.Unauthorized("unauthorized", nil)
	}

	userID, ok := claims["user_id"].(string)
	if !ok || userID == "" {
		return "", errs.Unauthorized("unauthorized", nil)
	}

	return userID, nil
}

func IsAdminFromCtx(c *fiber.Ctx) bool {
	user, ok := c.Locals("user").(*jwt.Token)
	if !ok || user == nil {
		return false
	}

	claims, ok := user.Claims.(jwt.MapClaims)
	if !ok {
		return false
	}

	role, ok := claims["user_role"].(string)
	if !ok {
		return false
	}

	return role == string(dto.Admin)
}
