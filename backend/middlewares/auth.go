package middlewares

import (
	"os"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/gofiber/fiber/v2"
	jwtware "github.com/gofiber/jwt/v4"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() fiber.Handler {
	secret := os.Getenv("SECRET")
	auth := jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{
			Key: []byte(secret),
		},

		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "unauthorized",
			})
		},
	})
	return auth
}

func CheckAdminRole() fiber.Handler {
	return func(c *fiber.Ctx) error {
		user, ok := c.Locals("user").(*jwt.Token)
		if !ok || user == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "unauthorized: missing or invalid token",
			})
		}

		claims := user.Claims.(jwt.MapClaims)
		userRole, ok := claims["user_role"].(string)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "invalid token payload",
			})
		}

		if userRole != string(core.Admin) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"message": "unauthorized: admin access required",
			})
		}

		return c.Next()
	}
}
