package neon

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/keywerk/internal/core/domain/dto"
	port "github.com/keywerk/internal/core/port/repository"
)

type neonOrderRepository struct {
	db *sqlx.DB
}

func NewNeonOrderRepository(db *sqlx.DB) port.OrderRepository {
	return &neonOrderRepository{db: db}
}

func (r *neonOrderRepository) Create(order dto.Order, items []dto.OrderItem) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	orderQuery := `
	INSERT INTO orders (
		order_id, user_id, status, total_price, shipping_method, tracking_number,
		receiver_name, phone_number, address_line1, address_line2,
		district, province, postal_code, created_at, updated_at
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`

	_, err = tx.Exec(orderQuery,
		order.ID,
		order.UserID,
		order.Status,
		order.TotalPrice,
		order.ShippingMethod,
		order.TrackingNumber,
		order.ReceiverName,
		order.PhoneNumber,
		order.AddressLine1,
		order.AddressLine2,
		order.District,
		order.Province,
		order.PostalCode,
		order.CreatedAt,
		order.UpdatedAt,
	)
	if err != nil {
		return err
	}

	itemQuery := `
	INSERT INTO ordersitems (orderitem_id, order_id, variant_id, unit_price, quantity)
	VALUES ($1, $2, $3, $4, $5)
	`

	for _, item := range items {
		_, err = tx.Exec(itemQuery, item.ID, item.OrderID, item.VariantID, item.UnitPrice, item.Quantity)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *neonOrderRepository) FindByID(orderID string) (*dto.Order, error) {
	query := `
	SELECT 
		order_id::text, 
		COALESCE(user_id::text, ''), 
		status, 
		total_price::text, 
		COALESCE(shipping_method, ''), 
		COALESCE(tracking_number, ''),
		COALESCE(receiver_name, ''), 
		COALESCE(phone_number, ''), 
		COALESCE(address_line1, ''), 
		COALESCE(address_line2, ''),
		COALESCE(district, ''), 
		COALESCE(province, ''), 
		COALESCE(postal_code, ''), 
		COALESCE(created_at, NOW()), 
		COALESCE(updated_at, NOW())
	FROM orders
	WHERE order_id = $1
	`

	var order dto.Order
	var totalPriceStr string
	err := r.db.QueryRow(query, orderID).Scan(
		&order.ID,
		&order.UserID,
		&order.Status,
		&totalPriceStr,
		&order.ShippingMethod,
		&order.TrackingNumber,
		&order.ReceiverName,
		&order.PhoneNumber,
		&order.AddressLine1,
		&order.AddressLine2,
		&order.District,
		&order.Province,
		&order.PostalCode,
		&order.CreatedAt,
		&order.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if totalPriceStr != "" {
		fmt.Sscanf(totalPriceStr, "%f", &order.TotalPrice)
	}

	return &order, nil
}

func (r *neonOrderRepository) FindItemsByOrderID(orderID string) ([]dto.ResOrderItem, error) {
	query := `
	SELECT 
		oi.orderitem_id::text,
		oi.variant_id::text,
		pv.name AS variant_name,
		p.product_id::text,
		p.name AS product_name,
		COALESCE(img.image_url, '') AS image_url,
		oi.unit_price::text,
		oi.quantity,
		(oi.unit_price * oi.quantity)::text AS subtotal
	FROM ordersitems oi
	JOIN productvariants pv ON oi.variant_id = pv.variant_id
	JOIN products p ON pv.product_id = p.product_id
	LEFT JOIN images img ON pv.image_id = img.image_id
	WHERE oi.order_id = $1
	ORDER BY oi.orderitem_id ASC
	`

	rows, err := r.db.Query(query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []dto.ResOrderItem
	for rows.Next() {
		var item dto.ResOrderItem
		var unitPriceStr, subtotalStr string
		err = rows.Scan(
			&item.OrderItemID,
			&item.VariantID,
			&item.VariantName,
			&item.ProductID,
			&item.ProductName,
			&item.ImageURL,
			&unitPriceStr,
			&item.Quantity,
			&subtotalStr,
		)
		if err != nil {
			return nil, err
		}
		if unitPriceStr != "" {
			fmt.Sscanf(unitPriceStr, "%f", &item.UnitPrice)
		}
		if subtotalStr != "" {
			fmt.Sscanf(subtotalStr, "%f", &item.Subtotal)
		}
		items = append(items, item)
	}

	return items, nil
}

func (r *neonOrderRepository) FindByUserID(userID string) ([]dto.ResOrder, error) {
	query := `
	SELECT 
		order_id::text, 
		user_id::text, 
		status, 
		total_price::text, 
		COALESCE(shipping_method, ''), 
		COALESCE(tracking_number, ''),
		COALESCE(receiver_name, ''), 
		COALESCE(phone_number, ''), 
		COALESCE(address_line1, ''), 
		COALESCE(address_line2, ''),
		COALESCE(district, ''), 
		COALESCE(province, ''), 
		COALESCE(postal_code, ''), 
		COALESCE(created_at, NOW()), 
		COALESCE(updated_at, NOW())
	FROM orders
	WHERE user_id = $1
	ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []dto.ResOrder
	for rows.Next() {
		var o dto.ResOrder
		var totalPriceStr string
		err = rows.Scan(
			&o.OrderID,
			&o.UserID,
			&o.Status,
			&totalPriceStr,
			&o.ShippingMethod,
			&o.TrackingNumber,
			&o.ReceiverName,
			&o.PhoneNumber,
			&o.AddressLine1,
			&o.AddressLine2,
			&o.District,
			&o.Province,
			&o.PostalCode,
			&o.CreatedAt,
			&o.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		if totalPriceStr != "" {
			fmt.Sscanf(totalPriceStr, "%f", &o.TotalPrice)
		}
		orders = append(orders, o)
	}

	return orders, nil
}

func (r *neonOrderRepository) FindAll() ([]dto.ResOrder, error) {
	query := `
	SELECT 
		order_id::text, 
		COALESCE(user_id::text, ''), 
		status, 
		total_price::text, 
		COALESCE(shipping_method, ''), 
		COALESCE(tracking_number, ''),
		COALESCE(receiver_name, ''), 
		COALESCE(phone_number, ''), 
		COALESCE(address_line1, ''), 
		COALESCE(address_line2, ''),
		COALESCE(district, ''), 
		COALESCE(province, ''), 
		COALESCE(postal_code, ''), 
		COALESCE(created_at, NOW()), 
		COALESCE(updated_at, NOW())
	FROM orders
	ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []dto.ResOrder
	for rows.Next() {
		var o dto.ResOrder
		var totalPriceStr string
		err = rows.Scan(
			&o.OrderID,
			&o.UserID,
			&o.Status,
			&totalPriceStr,
			&o.ShippingMethod,
			&o.TrackingNumber,
			&o.ReceiverName,
			&o.PhoneNumber,
			&o.AddressLine1,
			&o.AddressLine2,
			&o.District,
			&o.Province,
			&o.PostalCode,
			&o.CreatedAt,
			&o.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		if totalPriceStr != "" {
			fmt.Sscanf(totalPriceStr, "%f", &o.TotalPrice)
		}
		orders = append(orders, o)
	}

	return orders, nil
}

func (r *neonOrderRepository) UpdateStatus(orderID string, status dto.OrderStatus) error {
	query := `UPDATE orders SET status = $1, updated_at = $2 WHERE order_id = $3`
	result, err := r.db.Exec(query, status, time.Now(), orderID)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("order %s not found", orderID)
	}

	return nil
}

func (r *neonOrderRepository) UpdateAddress(orderID string, req dto.ReqUpdateOrderAddress) error {
	query := `
	UPDATE orders
	SET 
		receiver_name = $1,
		phone_number = $2,
		address_line1 = $3,
		address_line2 = $4,
		district = $5,
		province = $6,
		postal_code = $7,
		updated_at = $8
	WHERE order_id = $9 AND status = 'pending'
	`

	result, err := r.db.Exec(query,
		req.ReceiverName,
		req.PhoneNumber,
		req.AddressLine1,
		req.AddressLine2,
		req.District,
		req.Province,
		req.PostalCode,
		time.Now(),
		orderID,
	)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("cannot update address for order %s (order may not be in pending status)", orderID)
	}

	return nil
}

func (r *neonOrderRepository) UpdateTracking(orderID string, trackingNumber string, status dto.OrderStatus) error {
	var query string
	var err error
	var result sql.Result

	if status != "" {
		query = `UPDATE orders SET tracking_number = $1, status = $2, updated_at = $3 WHERE order_id = $4`
		result, err = r.db.Exec(query, trackingNumber, status, time.Now(), orderID)
	} else {
		query = `UPDATE orders SET tracking_number = $1, updated_at = $2 WHERE order_id = $3`
		result, err = r.db.Exec(query, trackingNumber, time.Now(), orderID)
	}

	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("order %s not found", orderID)
	}

	return nil
}
