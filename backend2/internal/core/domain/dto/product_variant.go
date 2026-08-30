package dto

type ProductVariant struct {
	ID         string
	ProductID  string
	ImageID    string
	Name       string
	Stock      int
	Price      float64
	SoldCount  int
	Attributes []byte
}

type ReqProductVariant struct {
	ProductID  string         `json:"product_id"`
	ImageID    string         `json:"image_id"`
	Name       string         `json:"variant_name"`
	Stock      int            `json:"stock"`
	Price      float64        `json:"price"`
	Attributes map[string]any `json:"attributes"`
}

type ResProductVariant struct {
	ID         string         `json:"variant_id"`
	ProductID  string         `json:"product_id"`
	ImageID    string         `json:"image_id"`
	Name       string         `json:"variant_name"`
	Stock      int            `json:"stock"`
	Price      float64        `json:"price"`
	SoldCount  int            `json:"sold_count"`
	Attributes map[string]any `json:"attributes"`
}
