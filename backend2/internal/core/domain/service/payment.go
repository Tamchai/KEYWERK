package service

import (
	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
	port "github.com/keywerk/internal/core/port/repository"
)

type PaymentService interface {
	CreatePayment(userID string, req dto.ReqCreatePayment) (*dto.ResPayment, error)
	GetPaymentByOrderID(orderID string, userID string, isAdmin bool) (*dto.ResPayment, error)
	GetAllPaymentsForAdmin() ([]dto.ResPayment, error)
	VerifyPayment(paymentID string, req dto.ReqVerifyPayment) error
}

type paymentService struct {
	paymentRepo port.PaymentRepository
	orderRepo   port.OrderRepository
}

func NewPaymentService(paymentRepo port.PaymentRepository, orderRepo port.OrderRepository) PaymentService {
	return &paymentService{
		paymentRepo: paymentRepo,
		orderRepo:   orderRepo,
	}
}

func (s *paymentService) CreatePayment(userID string, req dto.ReqCreatePayment) (*dto.ResPayment, error) {
	order, err := s.orderRepo.FindByID(req.OrderID)
	if err != nil {
		return nil, errs.NotFound("order not found", err)
	}

	if order.UserID != userID {
		return nil, errs.Unauthorized("unauthorized order payment", nil)
	}

	if order.Status == dto.OrderStatusCancelled {
		return nil, errs.BadRequest("cannot pay for cancelled order", nil)
	}

	existingPayment, _ := s.paymentRepo.FindByOrderID(req.OrderID)
	if existingPayment != nil && existingPayment.Status == dto.PaymentStatusPaid {
		return nil, errs.BadRequest("order is already paid", nil)
	}

	newPaymentID := uuid.NewString()
	payment := dto.Payment{
		ID:            newPaymentID,
		OrderID:       req.OrderID,
		Amount:        req.Amount,
		Status:        dto.PaymentStatusPending,
		PaymentMethod: req.PaymentMethod,
		PaidAt:        nil,
	}

	err = s.paymentRepo.Create(payment)
	if err != nil {
		return nil, errs.Internal("cannot create payment record", err)
	}

	res := &dto.ResPayment{
		PaymentID:     payment.ID,
		OrderID:       payment.OrderID,
		Amount:        payment.Amount,
		Status:        payment.Status,
		PaymentMethod: payment.PaymentMethod,
		PaidAt:        payment.PaidAt,
	}

	return res, nil
}

func (s *paymentService) GetPaymentByOrderID(orderID string, userID string, isAdmin bool) (*dto.ResPayment, error) {
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return nil, errs.NotFound("order not found", err)
	}

	if !isAdmin && order.UserID != userID {
		return nil, errs.Unauthorized("unauthorized payment access", nil)
	}

	payment, err := s.paymentRepo.FindByOrderID(orderID)
	if err != nil || payment == nil {
		return nil, errs.NotFound("payment not found for this order", err)
	}

	res := &dto.ResPayment{
		PaymentID:     payment.ID,
		OrderID:       payment.OrderID,
		Amount:        payment.Amount,
		Status:        payment.Status,
		PaymentMethod: payment.PaymentMethod,
		PaidAt:        payment.PaidAt,
	}

	return res, nil
}

func (s *paymentService) GetAllPaymentsForAdmin() ([]dto.ResPayment, error) {
	payments, err := s.paymentRepo.FindAll()
	if err != nil {
		return nil, errs.Internal("cannot get payments", err)
	}

	resList := make([]dto.ResPayment, 0, len(payments))
	for _, p := range payments {
		resList = append(resList, dto.ResPayment{
			PaymentID:     p.ID,
			OrderID:       p.OrderID,
			Amount:        p.Amount,
			Status:        p.Status,
			PaymentMethod: p.PaymentMethod,
			PaidAt:        p.PaidAt,
		})
	}

	return resList, nil
}

func (s *paymentService) VerifyPayment(paymentID string, req dto.ReqVerifyPayment) error {
	payment, err := s.paymentRepo.FindByID(paymentID)
	if err != nil || payment == nil {
		return errs.NotFound("payment not found", err)
	}

	err = s.paymentRepo.UpdateStatus(paymentID, req.Status)
	if err != nil {
		return errs.Internal("cannot update payment status", err)
	}

	// When payment is verified as paid, automatically update the order status to processing
	if req.Status == dto.PaymentStatusPaid {
		_ = s.orderRepo.UpdateStatus(payment.OrderID, dto.OrderStatusProcessing)
	}

	return nil
}
