package core

type ReqCategory struct {
	Name string `json:"name" binding:"required"`
}

type ResCategory struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}
