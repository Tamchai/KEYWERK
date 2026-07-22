package ports

import "github.com/MaKo114/KEYWERK/core"

type CartRepository interface {
	SaveCart(Cart *core.Cart) error
	FindByUserID(userID string) (*core.Cart, bool, error)
}
