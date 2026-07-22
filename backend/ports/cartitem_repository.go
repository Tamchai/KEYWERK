package ports

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/jmoiron/sqlx"
)

type CartItemRepository interface {
	CreateCartItem(cartItem core.CartItem) error
	FindItemInCart(cartID string, variantID string) (*core.CartItem, bool, error)
	UpdateItemInCart(item *core.CartItem) error
	DeleteItemInCart(variantID string) error
	GetItemInCart(cartID string) ([]core.CartItem, error)

	DeleteAllByCartID(tx *sqlx.Tx, cartID string) error
}
