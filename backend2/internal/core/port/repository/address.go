package port

import "github.com/keywerk/internal/core/domain/dto"

type AddressRepository interface {
	Save(dto.Address) error
	FindAll() ([]dto.Address, error)
	Update(dto.Address) error
	Delete(id string) error
}
