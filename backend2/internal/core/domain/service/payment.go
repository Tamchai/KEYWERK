package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
	"github.com/keywerk/internal/core/port/gateway"
	port "github.com/keywerk/internal/core/port/repository"
)

type PaymentService interface {
	CreatePayment(ctx context.Context, userID string, req dto.ReqCreatePayment) (*dto.ResPayment, error)
	HandleStripeWebhook(payload []byte, signature string) error
	GetPaymentByOrderID(orderID string, userID string, isAdmin bool) (*dto.ResPayment, error)
	GetAllPaymentsForAdmin() ([]dto.ResPayment, error)
	VerifyPayment(paymentID string, req dto.ReqVerifyPayment) error
}

type paymentService struct {
	paymentRepo port.PaymentRepository
	orderRepo   port.OrderRepository
	gateway     gateway.PaymentGateway
	frontendURL string
}

func NewPaymentService(paymentRepo port.PaymentRepository, orderRepo port.OrderRepository, paymentGateway gateway.PaymentGateway, frontendURL string) PaymentService {
	return &paymentService{paymentRepo: paymentRepo, orderRepo: orderRepo, gateway: paymentGateway, frontendURL: strings.TrimRight(frontendURL, "/")}
}

func (s *paymentService) CreatePayment(ctx context.Context, userID string, req dto.ReqCreatePayment) (*dto.ResPayment, error) {
	if s.gateway == nil {
		return nil, errs.Unavailable("Stripe payment is not configured", nil)
	}
	if err := validateUUID(req.OrderID, "order id"); err != nil {
		return nil, err
	}
	order, err := s.orderRepo.FindByID(req.OrderID)
	if err != nil {
		return nil, errs.NotFound("order not found", err)
	}
	if order.UserID != userID {
		return nil, errs.Forbidden("order payment denied", nil)
	}
	if order.Status == dto.OrderStatusCancelled {
		return nil, errs.BadRequest("cannot pay for cancelled order", nil)
	}

	payment, err := s.paymentRepo.FindByOrderID(req.OrderID)
	if err != nil {
		return nil, errs.Internal("cannot check existing payment", err)
	}
	if payment != nil {
		if payment.Status == dto.PaymentStatusPaid {
			return nil, errs.Conflict("order has already been paid", nil)
		}
		if payment.Status == dto.PaymentStatusPending && payment.CheckoutURL != "" {
			return paymentResponse(payment), nil
		}
		if payment.Status == dto.PaymentStatusFailed {
			retried, retryErr := s.paymentRepo.Retry(payment.ID, order.TotalPrice)
			if retryErr != nil {
				return nil, errs.Internal("cannot retry Stripe payment", retryErr)
			}
			if !retried {
				return nil, errs.Conflict("payment status changed; refresh and try again", nil)
			}
			payment.Status = dto.PaymentStatusPending
			payment.Amount = order.TotalPrice
			payment.PaidAt = nil
			payment.ProviderSessionID = ""
			payment.ProviderPaymentIntentID = ""
			payment.CheckoutURL = ""
			payment.CheckoutAttempt++
		}
	} else {
		payment = &dto.Payment{ID: uuid.NewString(), OrderID: req.OrderID, Amount: order.TotalPrice, Status: dto.PaymentStatusPending, PaymentMethod: "stripe"}
		if err := s.paymentRepo.Create(*payment); err != nil {
			if isUniqueViolation(err) {
				return nil, errs.Conflict("payment has already been started for this order", err)
			}
			return nil, errs.Internal("cannot create payment record", err)
		}
	}

	checkout, err := s.gateway.CreateCheckoutSession(ctx, gateway.CheckoutRequest{
		PaymentID:  payment.ID,
		OrderID:    payment.OrderID,
		Amount:     amountToCents(order.TotalPrice),
		Currency:   "thb",
		Name:       fmt.Sprintf("KEYWERK order #%s", shortID(order.ID)),
		SuccessURL: s.frontendURL + "/payments/success?session_id={CHECKOUT_SESSION_ID}&order_id=" + order.ID,
		CancelURL:  s.frontendURL + "/orders/" + order.ID + "?payment=cancelled",
		Attempt:    payment.CheckoutAttempt,
	})
	if err != nil {
		_ = s.paymentRepo.MarkCheckoutCreationFailed(payment.ID)
		return nil, errs.Unavailable("cannot start Stripe Checkout", err)
	}
	if err := s.paymentRepo.AttachStripeSession(payment.ID, checkout.ID, checkout.URL); err != nil {
		return nil, errs.Internal("cannot save Stripe Checkout session", err)
	}
	payment.ProviderSessionID = checkout.ID
	payment.CheckoutURL = checkout.URL
	return paymentResponse(payment), nil
}

func (s *paymentService) HandleStripeWebhook(payload []byte, signature string) error {
	if s.gateway == nil {
		return errs.Unavailable("Stripe payment is not configured", nil)
	}
	event, err := s.gateway.ParseWebhook(payload, signature)
	if err != nil {
		return errs.BadRequest("invalid Stripe webhook signature or payload", err)
	}

	var status dto.PaymentStatus
	switch event.Type {
	case "checkout.session.completed", "checkout.session.async_payment_succeeded":
		if event.PaymentStatus == "paid" {
			status = dto.PaymentStatusPaid
		} else {
			status = dto.PaymentStatusPending
		}
	case "checkout.session.async_payment_failed", "checkout.session.expired":
		status = dto.PaymentStatusFailed
	default:
		return nil
	}
	if err := validateUUID(event.PaymentID, "Stripe payment metadata"); err != nil {
		return err
	}
	if err := validateUUID(event.OrderID, "Stripe order metadata"); err != nil {
		return err
	}
	if event.SessionID == "" {
		return errs.BadRequest("Stripe Checkout Session id is missing", nil)
	}
	if err := s.paymentRepo.ProcessStripeEvent(event.ID, event.Type, event.PaymentID, event.OrderID, event.SessionID, event.PaymentIntentID, status); err != nil {
		return errs.Internal("cannot process Stripe webhook", err)
	}
	return nil
}

func (s *paymentService) GetPaymentByOrderID(orderID string, userID string, isAdmin bool) (*dto.ResPayment, error) {
	if err := validateUUID(orderID, "order id"); err != nil {
		return nil, err
	}
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return nil, errs.NotFound("order not found", err)
	}
	if !isAdmin && order.UserID != userID {
		return nil, errs.Forbidden("payment access denied", nil)
	}
	payment, err := s.paymentRepo.FindByOrderID(orderID)
	if err != nil || payment == nil {
		return nil, errs.NotFound("payment not found for this order", err)
	}
	return paymentResponse(payment), nil
}

func (s *paymentService) GetAllPaymentsForAdmin() ([]dto.ResPayment, error) {
	payments, err := s.paymentRepo.FindAll()
	if err != nil {
		return nil, errs.Internal("cannot get payments", err)
	}
	res := make([]dto.ResPayment, 0, len(payments))
	for i := range payments {
		res = append(res, *paymentResponse(&payments[i]))
	}
	return res, nil
}

func (s *paymentService) VerifyPayment(paymentID string, req dto.ReqVerifyPayment) error {
	if err := validateUUID(paymentID, "payment id"); err != nil {
		return err
	}
	if !req.Status.IsValidVerification() {
		return errs.BadRequest("payment status must be paid or failed", nil)
	}
	payment, err := s.paymentRepo.FindByID(paymentID)
	if err != nil || payment == nil {
		return errs.NotFound("payment not found", err)
	}
	if payment.Status == req.Status {
		return nil
	}
	if payment.Status == dto.PaymentStatusPaid {
		return errs.BadRequest("a paid payment cannot be changed", nil)
	}
	if req.Status == dto.PaymentStatusPaid {
		order, err := s.orderRepo.FindByID(payment.OrderID)
		if err != nil {
			return errs.NotFound("order not found", err)
		}
		if order.Status == dto.OrderStatusCancelled {
			return errs.BadRequest("cannot approve payment for cancelled order", nil)
		}
	}
	if err := s.paymentRepo.VerifyAndUpdateOrder(paymentID, payment.OrderID, req.Status); err != nil {
		return errs.Internal("cannot update payment status", err)
	}
	return nil
}

func paymentResponse(payment *dto.Payment) *dto.ResPayment {
	return &dto.ResPayment{
		PaymentID: payment.ID, OrderID: payment.OrderID, Amount: payment.Amount,
		Status: payment.Status, PaymentMethod: payment.PaymentMethod, PaidAt: payment.PaidAt,
		ProviderSessionID:       payment.ProviderSessionID,
		ProviderPaymentIntentID: payment.ProviderPaymentIntentID,
		CheckoutURL:             payment.CheckoutURL,
	}
}

func shortID(id string) string {
	if len(id) <= 8 {
		return id
	}
	return id[:8]
}
