package port

import "github.com/keywerk/internal/core/domain/dto"

type UerRepository interface {
	Save(dto.User) error

	FindEmail(email string) (*dto.User, bool, error)
}
