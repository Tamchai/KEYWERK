package ports

import "github.com/MaKo114/KEYWERK/core"

type AddressRepository interface {
	Save(addr *core.Address, userID string) error
	GetByUserID(userID string) ([]core.Address, error)
	Update(addr *core.Address, userID string) error
	Delete(addressID, userID string) error
	ClearDefault(userID string) error
}
