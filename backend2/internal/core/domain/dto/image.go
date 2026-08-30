package dto

import (
	"io"
	"time"
)

type Image struct {
	ID        string
	URL       string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type ResImage struct {
	ID  string `json:"image_id"`
	URL string `json:"image_url"`
}

type ReqImageData struct {
	FileName    string
	File        io.Reader
	ContentType string
}
