package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/jmoiron/sqlx"
)

type PaymentService interface {
	UpdateStatus(userID string, paymentID string) error
}

type paymentService struct {
	db          *sqlx.DB
	orderRepo   ports.OrderRepository
	paymentRepo ports.PaymentRepository
}

func NewPaymentService(db *sqlx.DB, paymentRepo ports.PaymentRepository, orderRepo ports.OrderRepository) PaymentService {
	return &paymentService{db: db, paymentRepo: paymentRepo, orderRepo: orderRepo}
}

func (s *paymentService) UpdateStatus(userID string, paymentID string) error {

	tx, err := s.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. ค้นหา Payment ตาม paymentID ที่รับมาจากหน้าบ้านก่อน (ผ่าน tx)
	payment, err := s.paymentRepo.FindPaymentByID(paymentID)
	if err != nil {
		fmt.Println("payment not found", err)
		return errors.New("payment not found")
	}

	// 2. ดึง Order ของ Payment ใบนี้ออกมาเช็ก
	order, err := s.orderRepo.FindOrderByID(payment.OrderID)
	if err != nil {
		return errors.New("associated order not found")
	}

	// 🛡️ 3. SECURITY CHECK: ยันว่า Order นี้เป็นของ User คนที่ล็อกอินอยู่จริงไหม!
	if order.UserID != userID {
		return errors.New("unauthorized: payment does not belong to this user")
	}

	// 4. เช็กกันจ่ายซ้ำ
	if payment.Status == core.PaymentPaid {
		return errors.New("this payment is already completed")
	}

	paid := time.Now()

	paymentToUpdate := core.Payment{
		ID:            paymentID,
		OrderID:       order.OrderID,
		Amount:        order.TotalPrice,
		Status:        core.PaymentPaid,
		PaymentMethod: payment.PaymentMethod,
		PaidAt:        &paid,
	}

	// 5. อัปเดต Payment
	err = s.paymentRepo.UpdatedPayment(tx, paymentID, paymentToUpdate)
	fmt.Println("err update", err)
	if err != nil {
		fmt.Println("err update", err)
		return err
	}

	// 🎯 6. อย่าลืม! อัปเดตสถานะของ Order ให้เป็น Completed/Processing ด้วยนะครับ
	// err = s.orderRepo.UpdateStatus(tx, order.OrderID, core.OrderCompleted)
	// if err != nil {
	// 	return err
	// }

	// ยืนยัน Transaction
	err = tx.Commit()
	if err != nil {
		fmt.Println("commit", err)
		return err
	}

	return nil
}
