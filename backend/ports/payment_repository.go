package ports

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/jmoiron/sqlx"
)

type PaymentRepository interface {
	Save(Tx *sqlx.Tx, payment core.Payment) (*core.Payment, error)
	UpdatedPayment(Tx *sqlx.Tx, paymentId string, payment core.Payment) error
	FindPaymentByID(paymentID string) (*core.Payment, error)
}
