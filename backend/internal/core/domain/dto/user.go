package dto

import "time"

type User struct {
	ID        string
	Image     string
	Name      string
	Email     string
	Password  string
	Role      User_role
	CreatedAt time.Time
	UpdatedAt time.Time
}

type User_role string

const (
	Admin  User_role = "admin"
	Member User_role = "member"
)

type ReqRegister struct {
	Image           string `json:"image"`
	Name            string `json:"name" binding:"required" validate:"required"`
	Email           string `json:"email" binding:"required" validate:"required,email"`
	Password        string `json:"password" binding:"required" validate:"required,min=4"`
	ConfirmPassword string `json:"confirm_password" binding:"required" validate:"required"`
}

type ReqLogin struct {
	Email    string `json:"email" binding:"required" validate:"required,email"`
	Password string `json:"password" binding:"required" validate:"required,min=4"`
}

type ReqUpdateProfile struct {
	Image *string `json:"image"`
	Name  *string `json:"name"`
}

type ResProfile struct {
	ID    string    `json:"user_id"`
	Image string    `json:"image"`
	Name  string    `json:"name"`
	Email string    `json:"email"`
	Role  User_role `json:"role"`
}
