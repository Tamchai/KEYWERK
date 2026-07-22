package services

import (
	"errors"
	"time"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type OrderService interface {
	Checkout(userID string, req core.CheckoutRequest) error
}

type orderService struct {
	db            *sqlx.DB
	paymentRepo   ports.PaymentRepository
	addressRepo   ports.AddressRepository
	variantRepo   ports.ProductVariantRepository
	cartRepo      ports.CartRepository
	cartItemRepo  ports.CartItemRepository
	orderRepo     ports.OrderRepository
	orderItemRepo ports.OrderItemRepository
}

func NewOrderService(
	db *sqlx.DB,
	paymentRepo ports.PaymentRepository,
	addressRepo ports.AddressRepository,
	variantRepo ports.ProductVariantRepository,
	cartRepo ports.CartRepository,
	cartItemRepo ports.CartItemRepository,
	orderRepo ports.OrderRepository,
	orderItemRepo ports.OrderItemRepository,
) OrderService {
	return &orderService{
		db:            db,
		paymentRepo:   paymentRepo,
		addressRepo:   addressRepo,
		variantRepo:   variantRepo,
		cartRepo:      cartRepo,
		cartItemRepo:  cartItemRepo,
		orderRepo:     orderRepo,
		orderItemRepo: orderItemRepo,
	}
}

func (s *orderService) Checkout(userID string, req core.CheckoutRequest) error {

	tx, err := s.db.Beginx()

	if err != nil {
		return err
	}

	defer tx.Rollback()

	address, err := s.addressRepo.GetAddresIsDefault(userID)

	if err != nil {
		return err
	}

	cart, found, err := s.cartRepo.FindByUserID(userID)

	if err != nil {
		return err
	}

	if !found {
		return errors.New("cart not found")
	}

	cartItems, err := s.cartItemRepo.GetItemInCart(cart.CartID)

	if err != nil {
		return err
	}

	if len(cartItems) == 0 {
		return errors.New("cart is empty")
	}

	generatedOrderID := uuid.NewString()

	// เตรียม order ไว้ก่อน
	newOrder := core.Order{
		OrderID:        generatedOrderID,
		UserID:         userID,
		Status:         core.OrderPending,
		TotalPrice:     0,
		ReceiverName:   address.ReceiverName,
		PhoneNumber:    address.PhoneNumber,
		AddressLine1:   address.AddressLine1,
		AddressLine2:   address.AddressLine2,
		District:       address.District,
		Province:       address.Province,
		PostalCode:     address.PostalCode,
		ShippingMethod: req.ShippingMethod,
		TrackingNumber: "",
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// เตรียม slice ไว้เก็บ orderitem รอเอาไป วนลูปแล้ว save ทีละตัว
	orderItemsToSave := make([]core.OrderItem, 0, len(cartItems))
	for i := range cartItems {
		productVariant, err := s.variantRepo.FindByVariantID(cartItems[i].VariantID)
		if err != nil {
			return err
		}

		// ตรวจสอบว่า สินค้าในคลัง น้อยกว่า ที่ลูกค้าจะสั่งซื้อหรือป่าว
		if productVariant.Stock < cartItems[i].Quantity {
			return errors.New("stock not enough for variant: " + cartItems[i].VariantID)
		}

		newOrderItem := core.OrderItem{
			OrderitemID: uuid.NewString(),
			OrderID:     generatedOrderID,
			VariantID:   productVariant.ID,
			UnitPrice:   productVariant.Price,
			Quantity:    cartItems[i].Quantity,
		}

		// คำนวนราคาสินค้าทั้งหมดในรายการสินค้า
		newOrder.TotalPrice += newOrderItem.UnitPrice * float64(newOrderItem.Quantity)
		orderItemsToSave = append(orderItemsToSave, newOrderItem)
	}

	err = s.orderRepo.SaveOrder(tx, newOrder)
	if err != nil {
		return err
	}

	// ลูปเพื่อทำการ save orderitem ทีละรายการ
	for _, item := range orderItemsToSave {
		err = s.orderItemRepo.SaveOrderItem(tx, item)
		if err != nil {
			return err
		}

		// 🎯 เพิ่มเติม: สั่งตัดสต็อกสินค้าออกตามจำนวนที่ซื้อ
		err = s.variantRepo.UpdateStock(tx, item.VariantID, -item.Quantity)
		if err != nil {
			return err
		}
	}

	newPayment := core.Payment{
		ID:            uuid.NewString(),
		OrderID:       newOrder.OrderID,
		Amount:        newOrder.TotalPrice,
		Status:        core.PaymentPending,
		PaymentMethod: "QRcode",
		PaidAt:        nil,
	}

	_, err = s.paymentRepo.Save(tx, newPayment)
	if err != nil {
		return err
	}

	err = s.cartItemRepo.DeleteAllByCartID(tx, cart.CartID)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}
