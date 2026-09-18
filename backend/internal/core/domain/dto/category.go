package dto

type Category struct {
	ID   string
	Name string
}

type ReqCategory struct {
	Name string `json:"category_name" validate:"required"`
}

type ResCategory struct {
	ID   string `json:"category_id"`
	Name string `json:"category_name"`
}
