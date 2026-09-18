package port

import "github.com/keywerk/internal/core/domain/dto"

type CartRepository interface {
	GetOrCreateCart(userID string) (*dto.Cart, error)
	GetCartItems(cartID string) ([]dto.ResCartItem, error)
	FindCartItem(cartID string, variantID string) (*dto.CartItem, error)
	FindCartItemByID(cartItemID string) (*dto.CartItem, error)
	AddItem(item dto.CartItem) error
	UpdateQuantity(cartItemID string, quantity int) error
	RemoveItem(cartItemID string) error
	ClearCart(cartID string) error
}
