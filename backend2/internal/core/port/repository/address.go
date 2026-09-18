package port

import "github.com/keywerk/internal/core/domain/dto"

type AddressRepository interface {
	Save(dto.Address) error
	FindByUserID(userID string) ([]dto.Address, error)
	FindByID(id string) (*dto.Address, error)
	Update(dto.Address) error
	Delete(address dto.Address) error
}
