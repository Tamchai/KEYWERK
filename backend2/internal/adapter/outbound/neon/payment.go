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

func (r *neonPaymentRepository) Retry(paymentID string, amount float64) (bool, error) {
	result, err := r.db.Exec(`
		UPDATE payments
		SET payment_method = 'stripe', amount = $1, status = 'pending', paid_at = NULL,
			provider_session_id = NULL, provider_payment_intent_id = NULL, checkout_url = NULL,
			checkout_attempt = checkout_attempt + 1, created_at = CURRENT_TIMESTAMP
		WHERE payment_id = $2 AND status = 'failed'`, amount, paymentID)
	if err != nil {
		return false, err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected == 1, nil
}

func (r *neonPaymentRepository) AttachStripeSession(paymentID string, sessionID string, checkoutURL string) error {
	result, err := r.db.Exec(`
		UPDATE payments
		SET provider_session_id = $1, checkout_url = $2
		WHERE payment_id = $3 AND status = 'pending'`, sessionID, checkoutURL, paymentID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected != 1 {
		return fmt.Errorf("payment %s is no longer pending", paymentID)
	}
	return nil
}

func (r *neonPaymentRepository) MarkCheckoutCreationFailed(paymentID string) error {
	_, err := r.db.Exec(`UPDATE payments SET status = 'failed' WHERE payment_id = $1 AND status = 'pending'`, paymentID)
	return err
}

func (r *neonPaymentRepository) FindByOrderID(orderID string) (*dto.Payment, error) {
	query := `
	SELECT payment_id::text, order_id::text, amount::text, status, COALESCE(payment_method, ''), paid_at,
		COALESCE(provider_session_id, ''), COALESCE(provider_payment_intent_id, ''), COALESCE(checkout_url, ''), checkout_attempt
	FROM payments
	WHERE order_id = $1
	ORDER BY created_at DESC
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
		&p.ProviderSessionID,
		&p.ProviderPaymentIntentID,
		&p.CheckoutURL,
		&p.CheckoutAttempt,
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
	SELECT payment_id::text, order_id::text, amount::text, status, COALESCE(payment_method, ''), paid_at,
		COALESCE(provider_session_id, ''), COALESCE(provider_payment_intent_id, ''), COALESCE(checkout_url, ''), checkout_attempt
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
		&p.ProviderSessionID,
		&p.ProviderPaymentIntentID,
		&p.CheckoutURL,
		&p.CheckoutAttempt,
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
	SELECT payment_id::text, order_id::text, amount::text, status, COALESCE(payment_method, ''), paid_at,
		COALESCE(provider_session_id, ''), COALESCE(provider_payment_intent_id, ''), COALESCE(checkout_url, ''), checkout_attempt
	FROM payments
	ORDER BY created_at DESC
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
			&p.ProviderSessionID,
			&p.ProviderPaymentIntentID,
			&p.CheckoutURL,
			&p.CheckoutAttempt,
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

func (r *neonPaymentRepository) ProcessStripeEvent(eventID, eventType, paymentID, orderID, sessionID, paymentIntentID string, status dto.PaymentStatus) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	result, err := tx.Exec(`
		INSERT INTO stripe_webhook_events (event_id, event_type)
		VALUES ($1, $2)
		ON CONFLICT (event_id) DO NOTHING`, eventID, eventType)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return tx.Commit()
	}

	var currentStatus dto.PaymentStatus
	var storedOrderID string
	var storedSessionID sql.NullString
	if err := tx.QueryRow(`
		SELECT status, order_id::text, provider_session_id
		FROM payments WHERE payment_id = $1 FOR UPDATE`, paymentID).Scan(&currentStatus, &storedOrderID, &storedSessionID); err != nil {
		return err
	}
	if storedOrderID != orderID {
		return errors.New("Stripe order metadata does not match payment")
	}
	if storedSessionID.Valid && storedSessionID.String != sessionID {
		// A delayed event from an older Checkout attempt is valid but stale.
		return tx.Commit()
	}
	if currentStatus == dto.PaymentStatusPaid {
		return tx.Commit()
	}

	if status == dto.PaymentStatusPending {
		_, err = tx.Exec(`
			UPDATE payments
			SET provider_session_id = COALESCE(provider_session_id, $1)
			WHERE payment_id = $2`, sessionID, paymentID)
		if err != nil {
			return err
		}
	} else {
		_, err = tx.Exec(`
			UPDATE payments
			SET status = $1::payment_status,
				provider_session_id = COALESCE(provider_session_id, $2),
				provider_payment_intent_id = NULLIF($3, ''),
				paid_at = CASE WHEN $1::text = 'paid' THEN COALESCE(paid_at, CURRENT_TIMESTAMP) ELSE NULL END
			WHERE payment_id = $4`, status, sessionID, paymentIntentID, paymentID)
		if err != nil {
			return err
		}
	}

	if status == dto.PaymentStatusPaid {
		result, err = tx.Exec(`
			UPDATE orders SET status = 'processing', updated_at = CURRENT_TIMESTAMP
			WHERE order_id = $1 AND status = 'pending'`, orderID)
		if err != nil {
			return err
		}
		affected, err = result.RowsAffected()
		if err != nil {
			return err
		}
		if affected != 1 {
			return errors.New("paid Stripe order is no longer pending")
		}
	}

	return tx.Commit()
}

func (r *neonPaymentRepository) VerifyAndUpdateOrder(paymentID string, orderID string, status dto.PaymentStatus) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var currentPaymentStatus dto.PaymentStatus
	if err := tx.QueryRow(`SELECT status FROM payments WHERE payment_id = $1 FOR UPDATE`, paymentID).Scan(&currentPaymentStatus); err != nil {
		return err
	}
	if currentPaymentStatus == dto.PaymentStatusPaid && status != dto.PaymentStatusPaid {
		return errors.New("paid payment cannot be changed")
	}
	if currentPaymentStatus == status {
		return tx.Commit()
	}

	var orderStatus dto.OrderStatus
	if err := tx.QueryRow(`SELECT status FROM orders WHERE order_id = $1 FOR UPDATE`, orderID).Scan(&orderStatus); err != nil {
		return err
	}
	if status == dto.PaymentStatusPaid && orderStatus == dto.OrderStatusCancelled {
		return errors.New("cannot approve payment for cancelled order")
	}

	result, err := tx.Exec(`
		UPDATE payments
		SET status = $1,
			paid_at = CASE
				WHEN $2 THEN COALESCE(paid_at, $3)
				ELSE NULL
			END
		WHERE payment_id = $4`, status, status == dto.PaymentStatusPaid, time.Now(), paymentID)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected != 1 {
		return fmt.Errorf("payment %s not found", paymentID)
	}

	if status == dto.PaymentStatusPaid {
		if _, err = tx.Exec(`
			UPDATE orders
			SET status = 'processing', updated_at = $1
			WHERE order_id = $2 AND status = 'pending'`, time.Now(), orderID); err != nil {
			return err
		}
	}

	return tx.Commit()
}
