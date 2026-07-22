package ports

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/jmoiron/sqlx"
)

type OrderRepository interface {
	SaveOrder(Tx *sqlx.Tx, order core.Order) error
	FindOrderByID(orderID string) (*core.Order, error)
}
