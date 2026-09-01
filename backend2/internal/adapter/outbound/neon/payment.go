package neon

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/keywerk/internal/core/domain/dto"
	port "github.com/keywerk/internal/core/port/repository"
)

type neonPaymentRepository struct {
	db *sqlx.DB
}

func NewNeonPaymentRepository(db *sqlx.DB) port.PaymentRepository {
	return &neonPaymentRepository{db: db}
}

func (r *neonPaymentRepository) Create(p dto.Payment) error {
	query := `
	INSERT INTO payments (payment_id, order_id, amount, status, payment_method, paid_at)
	VALUES ($1, $2, $3, $4, $5, $6)
	`
	result, err := r.db.Exec(query, p.ID, p.OrderID, p.Amount, p.Status, p.PaymentMethod, p.PaidAt)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return errors.New("cannot create payment record")
	}

	return nil
}

func (r *neonPaymentRepository) FindByOrderID(orderID string) (*dto.Payment, error) {
	query := `
	SELECT payment_id::text, order_id::text, amount::text, status, COALESCE(payment_method, ''), paid_at
	FROM payments
	WHERE order_id = $1
	ORDER BY paid_at DESC NULLS LAST
	LIMIT 1
	`

	var p dto.Payment
	var paidAt sql.NullTime
	var amountStr string

	err := r.db.QueryRow(query, orderID).Scan(
		&p.ID,
		&p.OrderID,
		&amountStr,
		&p.Status,
		&p.PaymentMethod,
		&paidAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	if amountStr != "" {
		fmt.Sscanf(amountStr, "%f", &p.Amount)
	}

	if paidAt.Valid {
		p.PaidAt = &paidAt.Time
	}

	return &p, nil
}

func (r *neonPaymentRepository) FindByID(paymentID string) (*dto.Payment, error) {
	query := `
	SELECT payment_id::text, order_id::text, amount::text, status, COALESCE(payment_method, ''), paid_at
	FROM payments
	WHERE payment_id = $1
	`

	var p dto.Payment
	var paidAt sql.NullTime
	var amountStr string

	err := r.db.QueryRow(query, paymentID).Scan(
		&p.ID,
		&p.OrderID,
		&amountStr,
		&p.Status,
		&p.PaymentMethod,
		&paidAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	if amountStr != "" {
		fmt.Sscanf(amountStr, "%f", &p.Amount)
	}

	if paidAt.Valid {
		p.PaidAt = &paidAt.Time
	}

	return &p, nil
}

func (r *neonPaymentRepository) FindAll() ([]dto.Payment, error) {
	query := `
	SELECT payment_id::text, order_id::text, amount::text, status, COALESCE(payment_method, ''), paid_at
	FROM payments
	ORDER BY paid_at DESC NULLS LAST
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []dto.Payment
	for rows.Next() {
		var p dto.Payment
		var paidAt sql.NullTime
		var amountStr string

		err = rows.Scan(
			&p.ID,
			&p.OrderID,
			&amountStr,
			&p.Status,
			&p.PaymentMethod,
			&paidAt,
		)
		if err != nil {
			return nil, err
		}

		if amountStr != "" {
			fmt.Sscanf(amountStr, "%f", &p.Amount)
		}

		if paidAt.Valid {
			p.PaidAt = &paidAt.Time
		}

		payments = append(payments, p)
	}

	return payments, nil
}

func (r *neonPaymentRepository) UpdateStatus(paymentID string, status dto.PaymentStatus) error {
	var query string
	var err error
	var result sql.Result

	now := time.Now()
	if status == dto.PaymentStatusPaid {
		query = `UPDATE payments SET status = $1, paid_at = $2 WHERE payment_id = $3`
		result, err = r.db.Exec(query, status, now, paymentID)
	} else {
		query = `UPDATE payments SET status = $1 WHERE payment_id = $2`
		result, err = r.db.Exec(query, status, paymentID)
	}

	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("payment %s not found", paymentID)
	}

	return nil
}
