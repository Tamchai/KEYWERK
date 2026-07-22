package adapters

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/jmoiron/sqlx"
)

type orderItemRepository struct {
	db *sqlx.DB
}

func NewOrderItemRepository(db *sqlx.DB) ports.OrderItemRepository {
	return &orderItemRepository{db: db}
}

func (r *orderItemRepository) SaveOrderItem(tx *sqlx.Tx, orderItem core.OrderItem) error {

	query := `
	INSERT INTO ordersitems (orderitem_id, order_id, variant_id, unit_price, quantity) VALUES ($1, $2, $3, $4, $5)
	`

	_, err := tx.Exec(query, orderItem.OrderitemID, orderItem.OrderID, orderItem.VariantID, orderItem.UnitPrice, orderItem.Quantity)
	if err != nil {
		return err
	}

	return nil
}
