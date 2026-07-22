package ports

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/jmoiron/sqlx"
)

type OrderItemRepository interface {
	SaveOrderItem(Tx *sqlx.Tx, orderItem core.OrderItem) error
}
