package services

import (
	"time"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/google/uuid"
)

type AddressService interface {
	SaveAddress(reqAddr *core.ReqAddress, userID string) error
	GetAddressesByUserID(userID string) ([]core.ResAddress, error)
	UpdateAddress(addressID string, reqAddr *core.ReqAddress, userID string) error
	DeleteAddress(addressID, userID string) error
}

type addressService struct {
	addressRepo ports.AddressRepository
}

func NewAddressService(addressRepo ports.AddressRepository) AddressService {
	return &addressService{addressRepo: addressRepo}
}

func (s *addressService) SaveAddress(reqAddr *core.ReqAddress, userID string) error {
	if reqAddr.IsDefault {
		if err := s.addressRepo.ClearDefault(userID); err != nil {
			return err
		}
	}

	addrToSave := core.Address{
		ID:           uuid.NewString(),
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

	return s.addressRepo.Save(&addrToSave, userID)
}

func (s *addressService) GetAddressesByUserID(userID string) ([]core.ResAddress, error) {
	addresses, err := s.addressRepo.GetByUserID(userID)
	if err != nil {
		return nil, err
	}

	response := make([]core.ResAddress, 0, len(addresses))
	for i := range addresses {
		response = append(response, core.ResAddress{
			ID:           addresses[i].ID,
			UserID:       addresses[i].UserID,
			Title:        addresses[i].Title,
			ReceiverName: addresses[i].ReceiverName,
			PhoneNumber:  addresses[i].PhoneNumber,
			AddressLine1: addresses[i].AddressLine1,
			AddressLine2: addresses[i].AddressLine2,
			District:     addresses[i].District,
			Province:     addresses[i].Province,
			PostalCode:   addresses[i].PostalCode,
			IsDefault:    addresses[i].IsDefault,
		})
	}

	return response, nil
}

func (s *addressService) UpdateAddress(addressID string, reqAddr *core.ReqAddress, userID string) error {
	if reqAddr.IsDefault {
		if err := s.addressRepo.ClearDefault(userID); err != nil {
			return err
		}
	}

	addrToUpdate := core.Address{
		ID:           addressID,
		Title:        reqAddr.Title,
		ReceiverName: reqAddr.ReceiverName,
		PhoneNumber:  reqAddr.PhoneNumber,
		AddressLine1: reqAddr.AddressLine1,
		AddressLine2: reqAddr.AddressLine2,
		District:     reqAddr.District,
		Province:     reqAddr.Province,
		PostalCode:   reqAddr.PostalCode,
		IsDefault:    reqAddr.IsDefault,
	}

	return s.addressRepo.Update(&addrToUpdate, userID)
}

func (s *addressService) DeleteAddress(addressID, userID string) error {
	return s.addressRepo.Delete(addressID, userID)
}
