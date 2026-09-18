package service

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
	port "github.com/keywerk/internal/core/port/repository"
)

type AddressService interface {
	CreateAddress(reqAddr dto.ReqAddress, userID string) error
	GetAddressesByUserID(userID string) ([]dto.ResAddress, error)
	GetAddressByID(addrID string, userID string) (*dto.ResAddress, error)
	UpdateAddress(reqAddr dto.ReqAddress, userID string, addrID string) error
	DeleteAddress(addrID string, userID string) error
}

type addressService struct {
	addressRepo port.AddressRepository
}

func NewAddressService(addressRepo port.AddressRepository) AddressService {
	return &addressService{addressRepo: addressRepo}
}

func (s *addressService) CreateAddress(reqAddr dto.ReqAddress, userID string) error {
	reqAddr = normalizeAddress(reqAddr)
	if err := validateAddress(reqAddr); err != nil {
		return err
	}
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

	err := s.addressRepo.Save(addrToSave)
	if err != nil {
		return errs.Internal("cannot insert address", err)
	}

	return nil
}

func (s *addressService) GetAddressesByUserID(userID string) ([]dto.ResAddress, error) {
	addresses, err := s.addressRepo.FindByUserID(userID)
	if err != nil {
		return nil, errs.Internal("cannot get addresses", err)
	}

	resList := make([]dto.ResAddress, 0, len(addresses))
	for _, a := range addresses {
		resList = append(resList, dto.ResAddress{
			ID:           a.ID,
			UserID:       a.UserID,
			Title:        a.Title,
			ReceiverName: a.ReceiverName,
			PhoneNumber:  a.PhoneNumber,
			AddressLine1: a.AddressLine1,
			AddressLine2: a.AddressLine2,
			District:     a.District,
			Province:     a.Province,
			PostalCode:   a.PostalCode,
			IsDefault:    a.IsDefault,
			CreatedAt:    a.CreatedAt,
		})
	}

	return resList, nil
}

func (s *addressService) GetAddressByID(addrID string, userID string) (*dto.ResAddress, error) {
	if err := validateUUID(addrID, "address id"); err != nil {
		return nil, err
	}
	addr, err := s.addressRepo.FindByID(addrID)
	if err != nil {
		return nil, errs.NotFound("address not found", err)
	}

	if addr.UserID != userID {
		return nil, errs.Forbidden("address access denied", nil)
	}

	res := &dto.ResAddress{
		ID:           addr.ID,
		UserID:       addr.UserID,
		Title:        addr.Title,
		ReceiverName: addr.ReceiverName,
		PhoneNumber:  addr.PhoneNumber,
		AddressLine1: addr.AddressLine1,
		AddressLine2: addr.AddressLine2,
		District:     addr.District,
		Province:     addr.Province,
		PostalCode:   addr.PostalCode,
		IsDefault:    addr.IsDefault,
		CreatedAt:    addr.CreatedAt,
	}

	return res, nil
}

func (s *addressService) UpdateAddress(reqAddr dto.ReqAddress, userID string, addrID string) error {
	if err := validateUUID(addrID, "address id"); err != nil {
		return err
	}
	reqAddr = normalizeAddress(reqAddr)
	if err := validateAddress(reqAddr); err != nil {
		return err
	}
	existing, err := s.addressRepo.FindByID(addrID)
	if err != nil {
		return errs.NotFound("address not found", err)
	}

	if existing.UserID != userID {
		return errs.Forbidden("address modification denied", nil)
	}

	addrToUpdate := dto.Address{
		ID:           addrID,
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
	}

	err = s.addressRepo.Update(addrToUpdate)
	if err != nil {
		return errs.Internal("cannot update address", err)
	}

	return nil
}

func normalizeAddress(req dto.ReqAddress) dto.ReqAddress {
	req.Title = strings.TrimSpace(req.Title)
	req.ReceiverName = strings.TrimSpace(req.ReceiverName)
	req.PhoneNumber = strings.TrimSpace(req.PhoneNumber)
	req.AddressLine1 = strings.TrimSpace(req.AddressLine1)
	req.AddressLine2 = strings.TrimSpace(req.AddressLine2)
	req.District = strings.TrimSpace(req.District)
	req.Province = strings.TrimSpace(req.Province)
	req.PostalCode = strings.TrimSpace(req.PostalCode)
	return req
}

func validateAddress(req dto.ReqAddress) error {
	if req.ReceiverName == "" || req.PhoneNumber == "" || req.AddressLine1 == "" || req.District == "" || req.Province == "" || req.PostalCode == "" {
		return errs.BadRequest("shipping address is incomplete", nil)
	}
	return nil
}

func (s *addressService) DeleteAddress(addrID string, userID string) error {
	if err := validateUUID(addrID, "address id"); err != nil {
		return err
	}
	existing, err := s.addressRepo.FindByID(addrID)
	if err != nil {
		return errs.NotFound("address not found", err)
	}

	if existing.UserID != userID {
		return errs.Forbidden("address deletion denied", nil)
	}

	err = s.addressRepo.Delete(*existing)
	if err != nil {
		msg := fmt.Sprintf("cannot delete address %s", addrID)
		return errs.Internal(msg, err)
	}

	return nil
}
