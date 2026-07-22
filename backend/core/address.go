package core

import "time"

type Address struct {
	ID           string
	UserID       string
	Title        string
	ReceiverName string
	PhoneNumber  string
	AddressLine1 string
	AddressLine2 string
	District     string
	Province     string
	PostalCode   string
	IsDefault    bool
	CreatedAt    time.Time
}

type ReqAddress struct {
	Title        string `json:"title"`
	ReceiverName string `json:"receiver_name"`
	PhoneNumber  string `json:"phone_number"`
	AddressLine1 string `json:"address_line1"`
	AddressLine2 string `json:"address_line2"`
	District     string `json:"district"`
	Province     string `json:"province"`
	PostalCode   string `json:"postal_code"`
	IsDefault    bool   `json:"is_default"`
}

type ResAddress struct {
	ID           string `json:"address_id"`
	UserID       string `json:"user_id"`
	Title        string `json:"title"`
	ReceiverName string `json:"receiver_name"`
	PhoneNumber  string `json:"phone_number"`
	AddressLine1 string `json:"address_line1"`
	AddressLine2 string `json:"address_line2"`
	District     string `json:"district"`
	Province     string `json:"province"`
	PostalCode   string `json:"postal_code"`
	IsDefault    bool   `json:"is_default"`
}
