package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
	port "github.com/keywerk/internal/core/port/repository"
)

type OrderService interface {
	CreateOrder(userID string, req dto.ReqCreateOrder) (*dto.ResOrderDetail, error)
	GetUserOrders(userID string) ([]dto.ResOrder, error)
	GetOrderDetail(orderID string, userID string, isAdmin bool) (*dto.ResOrderDetail, error)
	UpdateOrderAddress(orderID string, userID string, req dto.ReqUpdateOrderAddress) error
	GetAllOrdersForAdmin() ([]dto.ResOrder, error)
	UpdateOrderStatus(orderID string, req dto.ReqUpdateOrderStatus) error
	UpdateTrackingNumber(orderID string, req dto.ReqUpdateTracking) error
}

type orderService struct {
	orderRepo          port.OrderRepository
	cartRepo           port.CartRepository
	addressRepo        port.AddressRepository
	productVariantRepo port.ProductVariantRepository
	productRepo        port.ProductRepository
	paymentRepo        port.PaymentRepository
}

func NewOrderService(
	orderRepo port.OrderRepository,
	cartRepo port.CartRepository,
	addressRepo port.AddressRepository,
	productVariantRepo port.ProductVariantRepository,
	productRepo port.ProductRepository,
	paymentRepo port.PaymentRepository,
) OrderService {
	return &orderService{
		orderRepo:          orderRepo,
		cartRepo:           cartRepo,
		addressRepo:        addressRepo,
		productVariantRepo: productVariantRepo,
		productRepo:        productRepo,
		paymentRepo:        paymentRepo,
	}
}

func (s *orderService) CreateOrder(userID string, req dto.ReqCreateOrder) (*dto.ResOrderDetail, error) {
	// 1. Resolve Shipping Address
	receiverName := req.ReceiverName
	phoneNumber := req.PhoneNumber
	addressLine1 := req.AddressLine1
	addressLine2 := req.AddressLine2
	district := req.District
	province := req.Province
	postalCode := req.PostalCode

	if req.AddressID != "" {
		if err := validateUUID(req.AddressID, "address id"); err != nil {
			return nil, err
		}
		addr, err := s.addressRepo.FindByID(req.AddressID)
		if err != nil {
			return nil, errs.BadRequest("invalid address id", err)
		}
		if addr.UserID != userID {
			return nil, errs.Forbidden("address access denied", nil)
		}
		receiverName = addr.ReceiverName
		phoneNumber = addr.PhoneNumber
		addressLine1 = addr.AddressLine1
		addressLine2 = addr.AddressLine2
		district = addr.District
		province = addr.Province
		postalCode = addr.PostalCode
	}

	if receiverName == "" || phoneNumber == "" || addressLine1 == "" || district == "" || province == "" || postalCode == "" {
		return nil, errs.BadRequest("shipping address is incomplete (receiver_name, phone_number, address_line1, district, province, postal_code are required)", nil)
	}

	// 2. Resolve items to purchase
	type itemDetail struct {
		variantID string
		quantity  int
	}

	var itemsToProcess []itemDetail
	cartID := ""

	if len(req.Items) > 0 {
		seenVariants := make(map[string]struct{}, len(req.Items))
		for _, item := range req.Items {
			if err := validateUUID(item.VariantID, "variant id"); err != nil {
				return nil, err
			}
			if _, exists := seenVariants[item.VariantID]; exists {
				return nil, errs.BadRequest("duplicate product variant in order items", nil)
			}
			seenVariants[item.VariantID] = struct{}{}
			itemsToProcess = append(itemsToProcess, itemDetail{
				variantID: item.VariantID,
				quantity:  item.Quantity,
			})
		}
	} else {
		// Checkout from cart
		cart, err := s.cartRepo.GetOrCreateCart(userID)
		if err != nil {
			return nil, errs.Internal("cannot get cart", err)
		}

		cartItems, err := s.cartRepo.GetCartItems(cart.ID)
		if err != nil {
			return nil, errs.Internal("cannot get cart items", err)
		}

		if len(cartItems) == 0 {
			return nil, errs.BadRequest("cart is empty", nil)
		}
		cartID = cart.ID

		for _, ci := range cartItems {
			itemsToProcess = append(itemsToProcess, itemDetail{
				variantID: ci.VariantID,
				quantity:  ci.Quantity,
			})
		}
	}

	// 3. Verify stock and calculate total price
	var totalCents int64
	var orderItems []dto.OrderItem
	var resItems []dto.ResOrderItem
	newOrderID := uuid.NewString()

	for _, item := range itemsToProcess {
		variant, err := s.productVariantRepo.FindByID(item.variantID)
		if err != nil {
			return nil, errs.BadRequest(fmt.Sprintf("product variant not found: %s", item.variantID), err)
		}

		if variant.Stock < item.quantity {
			return nil, errs.BadRequest(fmt.Sprintf("insufficient stock for variant %s. available: %d", variant.Name, variant.Stock), nil)
		}

		subtotalCents := amountToCents(variant.Price) * int64(item.quantity)
		totalCents += subtotalCents
		subtotal := centsToAmount(subtotalCents)

		newOrderItemID := uuid.NewString()
		orderItems = append(orderItems, dto.OrderItem{
			ID:        newOrderItemID,
			OrderID:   newOrderID,
			VariantID: variant.ID,
			UnitPrice: variant.Price,
			Quantity:  item.quantity,
		})

		resItems = append(resItems, dto.ResOrderItem{
			OrderItemID: newOrderItemID,
			VariantID:   variant.ID,
			VariantName: variant.Name,
			ProductID:   variant.ProductID,
			UnitPrice:   variant.Price,
			Quantity:    item.quantity,
			Subtotal:    subtotal,
		})
	}

	// 4. Create the order, reserve stock, update sold counts, and clear the cart atomically.
	now := time.Now()
	order := dto.Order{
		ID:             newOrderID,
		UserID:         userID,
		Status:         dto.OrderStatusPending,
		TotalPrice:     centsToAmount(totalCents),
		ShippingMethod: req.ShippingMethod,
		ReceiverName:   receiverName,
		PhoneNumber:    phoneNumber,
		AddressLine1:   addressLine1,
		AddressLine2:   addressLine2,
		District:       district,
		Province:       province,
		PostalCode:     postalCode,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	err := s.orderRepo.Create(order, orderItems, cartID)
	if err != nil {
		return nil, errs.BadRequest("cannot create order; stock may have changed", err)
	}

	res := &dto.ResOrderDetail{
		ResOrder: dto.ResOrder{
			OrderID:        order.ID,
			UserID:         order.UserID,
			Status:         order.Status,
			TotalPrice:     order.TotalPrice,
			ShippingMethod: order.ShippingMethod,
			TrackingNumber: order.TrackingNumber,
			ReceiverName:   order.ReceiverName,
			PhoneNumber:    order.PhoneNumber,
			AddressLine1:   order.AddressLine1,
			AddressLine2:   order.AddressLine2,
			District:       order.District,
			Province:       order.Province,
			PostalCode:     order.PostalCode,
			CreatedAt:      order.CreatedAt,
			UpdatedAt:      order.UpdatedAt,
		},
		Items: resItems,
	}

	return res, nil
}

func (s *orderService) GetUserOrders(userID string) ([]dto.ResOrder, error) {
	orders, err := s.orderRepo.FindByUserID(userID)
	if err != nil {
		return nil, errs.Internal("cannot get orders", err)
	}
	return orders, nil
}

func (s *orderService) GetOrderDetail(orderID string, userID string, isAdmin bool) (*dto.ResOrderDetail, error) {
	if err := validateUUID(orderID, "order id"); err != nil {
		return nil, err
	}
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return nil, errs.NotFound("order not found", err)
	}

	if !isAdmin && order.UserID != userID {
		return nil, errs.Forbidden("order access denied", nil)
	}

	items, err := s.orderRepo.FindItemsByOrderID(orderID)
	if err != nil {
		return nil, errs.Internal("cannot get order items", err)
	}

	payment, _ := s.paymentRepo.FindByOrderID(orderID)
	var resPayment *dto.ResPayment
	if payment != nil {
		resPayment = &dto.ResPayment{
			PaymentID:     payment.ID,
			OrderID:       payment.OrderID,
			Amount:        payment.Amount,
			Status:        payment.Status,
			PaymentMethod: payment.PaymentMethod,
			PaidAt:        payment.PaidAt,
			ProviderSessionID:       payment.ProviderSessionID,
			ProviderPaymentIntentID: payment.ProviderPaymentIntentID,
			CheckoutURL:             payment.CheckoutURL,
		}
	}

	res := &dto.ResOrderDetail{
		ResOrder: dto.ResOrder{
			OrderID:        order.ID,
			UserID:         order.UserID,
			Status:         order.Status,
			TotalPrice:     order.TotalPrice,
			ShippingMethod: order.ShippingMethod,
			TrackingNumber: order.TrackingNumber,
			ReceiverName:   order.ReceiverName,
			PhoneNumber:    order.PhoneNumber,
			AddressLine1:   order.AddressLine1,
			AddressLine2:   order.AddressLine2,
			District:       order.District,
			Province:       order.Province,
			PostalCode:     order.PostalCode,
			CreatedAt:      order.CreatedAt,
			UpdatedAt:      order.UpdatedAt,
		},
		Items:   items,
		Payment: resPayment,
	}

	return res, nil
}

func (s *orderService) UpdateOrderAddress(orderID string, userID string, req dto.ReqUpdateOrderAddress) error {
	if err := validateUUID(orderID, "order id"); err != nil {
		return err
	}
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return errs.NotFound("order not found", err)
	}

	if order.UserID != userID {
		return errs.Forbidden("order modification denied", nil)
	}

	if order.Status != dto.OrderStatusPending {
		return errs.BadRequest("cannot update address for order that is already processed or shipped", nil)
	}

	err = s.orderRepo.UpdateAddress(orderID, req)
	if err != nil {
		return errs.Internal("cannot update order address", err)
	}

	return nil
}

func (s *orderService) GetAllOrdersForAdmin() ([]dto.ResOrder, error) {
	orders, err := s.orderRepo.FindAll()
	if err != nil {
		return nil, errs.Internal("cannot get orders", err)
	}
	return orders, nil
}

func (s *orderService) UpdateOrderStatus(orderID string, req dto.ReqUpdateOrderStatus) error {
	if err := validateUUID(orderID, "order id"); err != nil {
		return err
	}
	if !req.Status.IsValid() {
		return errs.BadRequest("invalid order status", nil)
	}

	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return errs.NotFound("order not found", err)
	}
	if !dto.CanTransitionOrderStatus(order.Status, req.Status) {
		return errs.BadRequest(fmt.Sprintf("cannot change order status from %s to %s", order.Status, req.Status), nil)
	}
	if order.Status == req.Status {
		return nil
	}

	err = s.orderRepo.UpdateStatus(orderID, order.Status, req.Status)
	if err != nil {
		if errors.Is(err, port.ErrActiveStripeCheckout) {
			return errs.Conflict("cannot cancel an order while Stripe Checkout is active", err)
		}
		return errs.Internal("cannot update order status", err)
	}

	return nil
}

func (s *orderService) UpdateTrackingNumber(orderID string, req dto.ReqUpdateTracking) error {
	if err := validateUUID(orderID, "order id"); err != nil {
		return err
	}
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return errs.NotFound("order not found", err)
	}

	status := req.Status
	if status == "" {
		status = dto.OrderStatusShipped
	}
	if !status.IsValid() {
		return errs.BadRequest("invalid order status", nil)
	}
	if !dto.CanTransitionOrderStatus(order.Status, status) {
		return errs.BadRequest(fmt.Sprintf("cannot change order status from %s to %s", order.Status, status), nil)
	}

	err = s.orderRepo.UpdateTracking(orderID, req.TrackingNumber, status)
	if err != nil {
		return errs.Internal("cannot update tracking number", err)
	}

	return nil
}
