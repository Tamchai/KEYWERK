package service

import (
	"context"
	"testing"

	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/port/gateway"
	port "github.com/keywerk/internal/core/port/repository"
)

const testOrderID = "7a14c3b2-0000-4000-8000-000000000001"
const testPaymentID = "7a14c3b2-0000-4000-8000-000000000002"

type reconcilePaymentRepo struct {
	port.PaymentRepository
	payment   dto.Payment
	processed bool
}

func (r *reconcilePaymentRepo) FindByOrderID(string) (*dto.Payment, error) { return &r.payment, nil }
func (r *reconcilePaymentRepo) ProcessStripeEvent(_, _, _, _, _, _ string, status dto.PaymentStatus) error {
	r.payment.Status = status
	r.processed = true
	return nil
}

type reconcileOrderRepo struct {
	port.OrderRepository
	order dto.Order
}

func (r *reconcileOrderRepo) FindByID(string) (*dto.Order, error) { return &r.order, nil }

type reconcileGateway struct {
	gateway.PaymentGateway
	session *gateway.CheckoutSessionStatus
}

func (g *reconcileGateway) GetCheckoutSession(context.Context, string) (*gateway.CheckoutSessionStatus, error) {
	return g.session, nil
}

func TestReconcilePaidCheckoutUpdatesPendingPayment(t *testing.T) {
	payments := &reconcilePaymentRepo{payment: dto.Payment{ID: testPaymentID, OrderID: testOrderID, Status: dto.PaymentStatusPending, ProviderSessionID: "cs_test_123"}}
	orders := &reconcileOrderRepo{order: dto.Order{ID: testOrderID, UserID: "user-1", Status: dto.OrderStatusPending}}
	stripe := &reconcileGateway{session: &gateway.CheckoutSessionStatus{ID: "cs_test_123", PaymentID: testPaymentID, OrderID: testOrderID, PaymentStatus: "paid"}}
	svc := NewPaymentService(payments, orders, stripe, "http://localhost:5173")
	result, err := svc.ReconcilePayment(context.Background(), testOrderID, "user-1", false)
	if err != nil {
		t.Fatal(err)
	}
	if result.Status != dto.PaymentStatusPaid || !payments.processed {
		t.Fatalf("paid checkout was not reconciled: %+v", result)
	}
}

func TestReconcileRejectsDifferentCheckoutMetadata(t *testing.T) {
	payments := &reconcilePaymentRepo{payment: dto.Payment{ID: testPaymentID, OrderID: testOrderID, Status: dto.PaymentStatusPending, ProviderSessionID: "cs_test_123"}}
	orders := &reconcileOrderRepo{order: dto.Order{ID: testOrderID, UserID: "user-1", Status: dto.OrderStatusPending}}
	stripe := &reconcileGateway{session: &gateway.CheckoutSessionStatus{ID: "cs_test_123", PaymentID: testPaymentID, OrderID: "other-order", PaymentStatus: "paid"}}
	svc := NewPaymentService(payments, orders, stripe, "http://localhost:5173")
	if _, err := svc.ReconcilePayment(context.Background(), testOrderID, "user-1", false); err == nil || payments.processed {
		t.Fatal("mismatched Checkout Session must not mark payment paid")
	}
}

func TestReconcileDoesNotApproveUnpaidCheckout(t *testing.T) {
	payments := &reconcilePaymentRepo{payment: dto.Payment{ID: testPaymentID, OrderID: testOrderID, Status: dto.PaymentStatusPending, ProviderSessionID: "cs_test_123"}}
	orders := &reconcileOrderRepo{order: dto.Order{ID: testOrderID, UserID: "user-1", Status: dto.OrderStatusPending}}
	stripe := &reconcileGateway{session: &gateway.CheckoutSessionStatus{ID: "cs_test_123", PaymentID: testPaymentID, OrderID: testOrderID, PaymentStatus: "unpaid", SessionStatus: "open"}}
	svc := NewPaymentService(payments, orders, stripe, "http://localhost:5173")
	result, err := svc.ReconcilePayment(context.Background(), testOrderID, "user-1", false)
	if err != nil {
		t.Fatal(err)
	}
	if result.Status != dto.PaymentStatusPending || payments.processed {
		t.Fatal("unpaid checkout must remain pending")
	}
}

func TestReconcileCannotReadAnotherUsersOrder(t *testing.T) {
	payments := &reconcilePaymentRepo{payment: dto.Payment{ID: testPaymentID, OrderID: testOrderID, Status: dto.PaymentStatusPending, ProviderSessionID: "cs_test_123"}}
	orders := &reconcileOrderRepo{order: dto.Order{ID: testOrderID, UserID: "user-1", Status: dto.OrderStatusPending}}
	stripe := &reconcileGateway{session: &gateway.CheckoutSessionStatus{ID: "cs_test_123", PaymentID: testPaymentID, OrderID: testOrderID, PaymentStatus: "paid"}}
	svc := NewPaymentService(payments, orders, stripe, "http://localhost:5173")
	if _, err := svc.ReconcilePayment(context.Background(), testOrderID, "user-2", false); err == nil || payments.processed {
		t.Fatal("another user must not reconcile this order")
	}
}
