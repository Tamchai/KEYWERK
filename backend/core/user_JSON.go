package core

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
