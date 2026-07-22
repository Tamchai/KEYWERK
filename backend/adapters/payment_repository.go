package adapters

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/jmoiron/sqlx"
)

type paymentRepository struct {
	db *sqlx.DB
}

func NewPaymentRepository(db *sqlx.DB) ports.PaymentRepository {
	return &paymentRepository{db: db}
}

func (r *paymentRepository) Save(tx *sqlx.Tx, payment core.Payment) (*core.Payment, error) {
	query := `
		INSERT INTO payments (payment_id, order_id, amount, status, payment_method, paid_at) 
		VALUES ($1, $2, $3, $4, $5, $6) 
		RETURNING payment_id
	`

	err := tx.QueryRow(
		query,
		payment.ID,
		payment.OrderID,
		payment.Amount,
		payment.Status,
		payment.PaymentMethod,
		payment.PaidAt,
	).Scan(&payment.ID)

	if err != nil {
		return nil, err
	}

	return &payment, nil
}

func (r *paymentRepository) UpdatedPayment(tx *sqlx.Tx, paymentID string, payment core.Payment) error {

	query := `update payments set status = $1, paid_at = $2 where payment_id = $3`

	_, err := tx.Exec(query, payment.Status, payment.PaidAt, paymentID)
	if err != nil {
		return err
	}

	return nil
}

// เปลี่ยนรับ tx *sqlx.Tx หรือ *sqlx.DB ก็ได้ด้วย sqlx.Get
func (r *paymentRepository) FindPaymentByID(paymentID string) (*core.Payment, error) {
	query := `
		SELECT payment_id, order_id, amount, status, payment_method, paid_at 
		FROM payments 
		WHERE payment_id = $1
	`

	var payment core.Payment
	// 🎯 ใช้ tx.Get สั้นกระชับ ไม่ต้องเขียน .Scan() ยาวๆ เองครับ!
	err := r.db.QueryRow(query, paymentID).Scan(&payment.ID, &payment.OrderID, &payment.Amount, &payment.Status, &payment.PaymentMethod, &payment.PaidAt)
	if err != nil {
		return nil, err
	}

	return &payment, nil
}
