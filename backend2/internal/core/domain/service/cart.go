package service

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
	port "github.com/keywerk/internal/core/port/repository"
)

type CartService interface {
	GetCart(userID string) (*dto.ResCart, error)
	AddToCart(userID string, req dto.ReqAddToCart) error
	UpdateCartItem(userID string, cartItemID string, req dto.ReqUpdateCartItem) error
	RemoveCartItem(userID string, cartItemID string) error
	ClearCart(userID string) error
}

type cartService struct {
	cartRepo           port.CartRepository
	productVariantRepo port.ProductVariantRepository
}

func NewCartService(cartRepo port.CartRepository, productVariantRepo port.ProductVariantRepository) CartService {
	return &cartService{
		cartRepo:           cartRepo,
		productVariantRepo: productVariantRepo,
	}
}

func (s *cartService) GetCart(userID string) (*dto.ResCart, error) {
	cart, err := s.cartRepo.GetOrCreateCart(userID)
	if err != nil {
		return nil, errs.Internal("cannot get or create cart", err)
	}

	items, err := s.cartRepo.GetCartItems(cart.ID)
	if err != nil {
		return nil, errs.Internal("cannot get cart items", err)
	}

	var totalPrice float64
	var totalItems int

	for _, item := range items {
		totalPrice += item.Subtotal
		totalItems += item.Quantity
	}

	res := &dto.ResCart{
		CartID:     cart.ID,
		UserID:     cart.UserID,
		Items:      items,
		TotalItems: totalItems,
		TotalPrice: totalPrice,
	}

	return res, nil
}

func (s *cartService) AddToCart(userID string, req dto.ReqAddToCart) error {
	variant, err := s.productVariantRepo.FindByID(req.VariantID)
	if err != nil {
		return errs.NotFound("product variant not found", err)
	}

	if variant.Stock < req.Quantity {
		return errs.BadRequest(fmt.Sprintf("not enough stock. available: %d", variant.Stock), nil)
	}

	cart, err := s.cartRepo.GetOrCreateCart(userID)
	if err != nil {
		return errs.Internal("cannot get or create cart", err)
	}

	existingItem, err := s.cartRepo.FindCartItem(cart.ID, req.VariantID)
	if err != nil {
		return errs.Internal("cannot check cart item", err)
	}

	if existingItem != nil {
		newQty := existingItem.Quantity + req.Quantity
		if variant.Stock < newQty {
			return errs.BadRequest(fmt.Sprintf("cannot add more than available stock (%d in stock, %d already in cart)", variant.Stock, existingItem.Quantity), nil)
		}

		err = s.cartRepo.UpdateQuantity(existingItem.ID, newQty)
		if err != nil {
			return errs.Internal("cannot update cart item quantity", err)
		}
	} else {
		newItem := dto.CartItem{
			ID:        uuid.NewString(),
			CartID:    cart.ID,
			VariantID: req.VariantID,
			Quantity:  req.Quantity,
		}

		err = s.cartRepo.AddItem(newItem)
		if err != nil {
			return errs.Internal("cannot add item to cart", err)
		}
	}

	return nil
}

func (s *cartService) UpdateCartItem(userID string, cartItemID string, req dto.ReqUpdateCartItem) error {
	cart, err := s.cartRepo.GetOrCreateCart(userID)
	if err != nil {
		return errs.Internal("cannot get cart", err)
	}

	item, err := s.cartRepo.FindCartItemByID(cartItemID)
	if err != nil || item == nil {
		return errs.NotFound("cart item not found", err)
	}

	if item.CartID != cart.ID {
		return errs.Unauthorized("unauthorized cart item access", nil)
	}

	variant, err := s.productVariantRepo.FindByID(item.VariantID)
	if err != nil {
		return errs.NotFound("product variant not found", err)
	}

	if variant.Stock < req.Quantity {
		return errs.BadRequest(fmt.Sprintf("not enough stock. available: %d", variant.Stock), nil)
	}

	err = s.cartRepo.UpdateQuantity(cartItemID, req.Quantity)
	if err != nil {
		return errs.Internal("cannot update cart item quantity", err)
	}

	return nil
}

func (s *cartService) RemoveCartItem(userID string, cartItemID string) error {
	cart, err := s.cartRepo.GetOrCreateCart(userID)
	if err != nil {
		return errs.Internal("cannot get cart", err)
	}

	item, err := s.cartRepo.FindCartItemByID(cartItemID)
	if err != nil || item == nil {
		return errs.NotFound("cart item not found", err)
	}

	if item.CartID != cart.ID {
		return errs.Unauthorized("unauthorized cart item access", nil)
	}

	err = s.cartRepo.RemoveItem(cartItemID)
	if err != nil {
		return errs.Internal("cannot remove cart item", err)
	}

	return nil
}

func (s *cartService) ClearCart(userID string) error {
	cart, err := s.cartRepo.GetOrCreateCart(userID)
	if err != nil {
		return errs.Internal("cannot get cart", err)
	}

	err = s.cartRepo.ClearCart(cart.ID)
	if err != nil {
		return errs.Internal("cannot clear cart", err)
	}

	return nil
}
