package dto

type Brand struct {
	ID   string
	Name string
}

type ResBrand struct {
	ID   string `json:"brand_id"`
	Name string `json:"brand_name"`
}

type ReqBrand struct {
	Name string `json:"brand_name" validate:"required"`
}
