package service

import (
	"time"

	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
	port "github.com/keywerk/internal/core/port/repository"
)

type AddressService interface {
	CreateAddress(reqAddr dto.ReqAddress, userID string) error
	UpdateAddress(reqAddr dto.ReqAddress, userID string, addrID string) error
	DeleteAddress(addrID string) error
}

type addressService struct {
	addrressRepo port.AddressRepository
}

func NewAddressService(addrressRepo port.AddressRepository) AddressService {
	return &addressService{addrressRepo: addrressRepo}
}

func (s *addressService) CreateAddress(reqAddr dto.ReqAddress, userID string) error {

	addrToSave := dto.Address{
		ID:           uuid.NewString(),
		UserID:       userID,
		Title:        reqAddr.Title,
		ReceiverName: reqAddr.ReceiverName,
		PhoneNumber:  reqAddr.PhoneNumber,
		AddressLine1: reqAddr.AddressLine1,
		AddressLine2: reqAddr.AddressLine2,
		District:     reqAddr.District,
		Province:     reqAddr.Province,
		PostalCode:   reqAddr.PostalCode,
		IsDefault:    reqAddr.IsDefault,
		CreatedAt:    time.Now(),
	}

	err := s.addrressRepo.Save(addrToSave)
	if err != nil {
		return errs.Internal("cannot insert address", err)
	}

	return nil
}

// ยังไม่ได้ทำ
func (s *addressService) UpdateAddress(reqAddr dto.ReqAddress, userID string, addrID string) error {

	return nil
}

// ยังไม่ได้ทำ
func (s *addressService) DeleteAddress(addrID string) error {
	return nil
}
