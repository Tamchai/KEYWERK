package middleware

import (
	"github.com/gofiber/fiber/v2"
	jwtware "github.com/gofiber/jwt/v4"
	"github.com/golang-jwt/jwt/v5"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/spf13/viper"
)

func AuthMiddleware() fiber.Handler {
	secret := viper.GetString("app.secret")
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

		if userRole != string(dto.Admin) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"message": "unauthorized: admin access required",
			})
		}

		return c.Next()
	}
}
