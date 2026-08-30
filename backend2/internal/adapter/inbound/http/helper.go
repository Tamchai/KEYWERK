package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/keywerk/internal/core/domain/errs"
)

func GetUserIDFromCtx(c *fiber.Ctx) (string, error) {
	// 1. ดึง token ออกมาจาก c.Locals("user") ที่ jwtware เซ็ตไว้ให้
	user, ok := c.Locals("user").(*jwt.Token)
	if !ok || user == nil {
		return "", errs.Unauthorized("unauthorized", nil)
	}

	// 2. ดึง claims
	claims, ok := user.Claims.(jwt.MapClaims)
	if !ok {
		return "", errs.Unauthorized("unauthorized", nil)
	}

	// 3. ดึง user_id
	userID, ok := claims["user_id"].(string)
	if !ok || userID == "" {
		return "", errs.Unauthorized("unauthorized", nil)
	}

	return userID, nil
}
