package core

type ProductVariant struct {
	ID        string
	Name      string
	Stock     int
	Price     float64
	ProductID string

	Product Product
}

type ReqProductVariant struct {
	ProductID string  `json:"product_id" validate:"required"`
	Name      string  `json:"name" validate:"required"`
	Price     float64 `json:"price" validate:"required"`
	Stock     int     `json:"stock" validate:"required"`
}

type ResProductVariant struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Price     float64 `json:"price"`
	Stock     int     `json:"stock"`
	ProductID string  `json:"product_id"`

	Product ProductResponse `json:"product"`
}

type ProductResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Image string `json:"image"`
}
