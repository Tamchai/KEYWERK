package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/google/uuid"
)

type CartService interface {
	AddItem(userID string, reqCartItem core.ReqCartItem) error
	RemoveItemInCart(cartID, variantID string) error
	GetItems(userID string) ([]core.ResCartItem, error)
}

type cartService struct {
	cartRepo     ports.CartRepository
	cartItemRepo ports.CartItemRepository
}

func NewCartService(cartRepo ports.CartRepository, cartItemRepo ports.CartItemRepository) CartService {
	return &cartService{cartRepo: cartRepo, cartItemRepo: cartItemRepo}
}

func (s *cartService) AddItem(userID string, reqCartItem core.ReqCartItem) error {

	cart, found, err := s.cartRepo.FindByUserID(userID)
	if err != nil {
		fmt.Println(err)
		return err
	}

	if !found {
		newCart := core.Cart{
			CartID:    uuid.NewString(),
			UserID:    userID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		err = s.cartRepo.SaveCart(&newCart)
		if err != nil {
			return err
		}
		cart = &newCart
	}

	cartItem := core.CartItem{
		VariantID: reqCartItem.VariantID,
		Quantity:  reqCartItem.Quantity,
	}

	item, found, err := s.cartItemRepo.FindItemInCart(cart.CartID, cartItem.VariantID)
	if err != nil {
		return err
	}

	if found {
		item.Quantity += reqCartItem.Quantity
		return s.cartItemRepo.UpdateItemInCart(item)
	}

	return s.cartItemRepo.CreateCartItem(core.CartItem{
		CartItemID: uuid.NewString(),
		CartID:     cart.CartID,
		VariantID:  cartItem.VariantID,
		Quantity:   cartItem.Quantity,
	})

}

func (s *cartService) RemoveItemInCart(cartID, variantID string) error {

	item, found, err := s.cartItemRepo.FindItemInCart(cartID, variantID)
	if err != nil {
		fmt.Println("น่าจะ error ตรงนี้เพราะไม่เจอ", err)
		return err
	}

	if !found {
		return errors.New("ไม่พบสินค้าชิ้นนี้ในตะกร้าของคุณ")
	}

	newitem := core.CartItem{
		CartItemID: item.CartItemID,
		CartID:     item.CartID,
		VariantID:  variantID,
		Quantity:   item.Quantity - 1,
	}

	if newitem.Quantity <= 0 {
		err = s.cartItemRepo.DeleteItemInCart(variantID)
		if err != nil {
			fmt.Println(err)
			return err
		}
		return nil
	}

	err = s.cartItemRepo.UpdateItemInCart(&newitem)
	if err != nil {
		fmt.Println(err)
		return err
	}

	return nil
}

func (s *cartService) GetItems(userID string) ([]core.ResCartItem, error) {

	cart, found, err := s.cartRepo.FindByUserID(userID)

	if err != nil {
		return nil, err
	}

	if !found {
		return []core.ResCartItem{}, nil
	}

	items, err := s.cartItemRepo.GetItemInCart(cart.CartID)
	fmt.Println(items)
	if err != nil {
		return nil, err
	}

	if items == nil {
		return []core.ResCartItem{}, nil
	}

	newItems := make([]core.ResCartItem, 0, len(items))

	for i := range items {
		newItems = append(newItems, core.ResCartItem{
			VariantID: items[i].VariantID,
			Quantity:  items[i].Quantity,
		})
	}

	return newItems, nil
}
