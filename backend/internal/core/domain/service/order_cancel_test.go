package service

import (
	"testing"

	"github.com/keywerk/internal/core/domain/dto"
	port "github.com/keywerk/internal/core/port/repository"
)

type cancelOrderRepo struct {
	port.OrderRepository
	order   dto.Order
	updated bool
}

func (r *cancelOrderRepo) FindByID(string) (*dto.Order, error) { return &r.order, nil }
func (r *cancelOrderRepo) UpdateStatus(_ string, from, to dto.OrderStatus) error {
	if from == dto.OrderStatusPending && to == dto.OrderStatusCancelled {
		r.updated = true
	}
	return nil
}

type cancelPaymentRepo struct {
	port.PaymentRepository
	payment *dto.Payment
}

func (r *cancelPaymentRepo) FindByOrderID(string) (*dto.Payment, error) { return r.payment, nil }

func TestCustomerCanCancelUnpaidPendingOrder(t *testing.T) {
	orders := &cancelOrderRepo{order: dto.Order{ID: testOrderID, UserID: "user-1", Status: dto.OrderStatusPending}}
	payments := &cancelPaymentRepo{}
	svc := NewOrderService(orders, nil, nil, nil, nil, payments)
	if err := svc.CancelMyOrder(testOrderID, "user-1"); err != nil {
		t.Fatal(err)
	}
	if !orders.updated {
		t.Fatal("pending order was not cancelled")
	}
}

func TestCustomerCannotCancelActiveCheckoutOrPaidOrder(t *testing.T) {
	for _, payment := range []*dto.Payment{
		{Status: dto.PaymentStatusPending},
		{Status: dto.PaymentStatusPending, ProviderSessionID: "cs_test_active"},
		{Status: dto.PaymentStatusPaid},
	} {
		orders := &cancelOrderRepo{order: dto.Order{ID: testOrderID, UserID: "user-1", Status: dto.OrderStatusPending}}
		svc := NewOrderService(orders, nil, nil, nil, nil, &cancelPaymentRepo{payment: payment})
		if err := svc.CancelMyOrder(testOrderID, "user-1"); err == nil || orders.updated {
			t.Fatal("active or paid Checkout must not be cancelled")
		}
	}
}

func TestCustomerCannotCancelAnotherUsersOrder(t *testing.T) {
	orders := &cancelOrderRepo{order: dto.Order{ID: testOrderID, UserID: "user-1", Status: dto.OrderStatusPending}}
	svc := NewOrderService(orders, nil, nil, nil, nil, &cancelPaymentRepo{})
	if err := svc.CancelMyOrder(testOrderID, "user-2"); err == nil || orders.updated {
		t.Fatal("non-owner cancelled the order")
	}
}
