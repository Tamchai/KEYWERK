package core

type ReqBrand struct {
	Name string `json:"name" binding:"required"`
}
