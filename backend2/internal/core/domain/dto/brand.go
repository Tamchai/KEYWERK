package dto

type Brand struct {
	ID   string
	Name string
}

type ResBrand struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type ReqBrand struct {
	Name string `json:"name" validate:"required"`
}
