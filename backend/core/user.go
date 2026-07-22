package core

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

type RegisterReq struct {
	Image    string `json:"image"`
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginReq struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}
