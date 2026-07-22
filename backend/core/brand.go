package core

type Brand struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type ReqBrand struct {
	Name string `json:"name" binding:"required"`
}
