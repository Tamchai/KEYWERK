package adapters

import (
	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/jmoiron/sqlx"
)

type orderRepository struct {
	db *sqlx.DB
}

func NewOrderRepository(db *sqlx.DB) ports.OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) SaveOrder(tx *sqlx.Tx, order core.Order) error {

	query := `
	INSERT INTO orders (
		order_id,
		user_id,
		status,
		total_price,
		shipping_method,
		tracking_number,
		created_at,
		receiver_name,
		phone_number,
		address_line1,
		address_line2,
		district,
		province,
		postal_code,
		updated_at
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`

	_, err := tx.Exec(
		query,
		order.OrderID,
		order.UserID,
		order.Status,
		order.TotalPrice,
		order.ShippingMethod,
		order.TrackingNumber,
		order.CreatedAt,
		order.ReceiverName,
		order.PhoneNumber,
		order.AddressLine1,
		order.AddressLine2,
		order.District,
		order.Province,
		order.PostalCode,
		order.UpdatedAt,
	)

	if err != nil {
		return err
	}

	return nil
}

func (r *orderRepository) FindOrderByID(orderID string) (*core.Order, error) {

	query := `
	select 
		order_id,
		user_id,
		status,
		total_price,
		shipping_method,
		tracking_number,
		created_at,
		receiver_name,
		phone_number,
		address_line1,
		address_line2,
		district,
		province,
		postal_code,
		updated_at
	from orders
	where order_id = $1
		`

	var order core.Order

	err := r.db.QueryRow(query, orderID).Scan(
		&order.OrderID,
		&order.UserID,
		&order.Status,
		&order.TotalPrice,
		&order.ShippingMethod,
		&order.TrackingNumber,
		&order.CreatedAt,
		&order.ReceiverName,
		&order.PhoneNumber,
		&order.AddressLine1,
		&order.AddressLine2,
		&order.District,
		&order.Province,
		&order.PostalCode,
		&order.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &order, nil
}
