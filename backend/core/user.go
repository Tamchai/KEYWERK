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
