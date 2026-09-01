package neon

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/keywerk/internal/core/domain/dto"
	port "github.com/keywerk/internal/core/port/repository"
)

type neonCartRepository struct {
	db *sqlx.DB
}

func NewNeonCartRepository(db *sqlx.DB) port.CartRepository {
	return &neonCartRepository{db: db}
}

func (r *neonCartRepository) GetOrCreateCart(userID string) (*dto.Cart, error) {
	var cart dto.Cart
	query := `SELECT cart_id, user_id, created_at, updated_at FROM carts WHERE user_id = $1`

	err := r.db.QueryRow(query, userID).Scan(&cart.ID, &cart.UserID, &cart.CreatedAt, &cart.UpdatedAt)
	if err == nil {
		return &cart, nil
	}

	if !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	// Not found, create new cart
	newCartID := uuid.NewString()
	now := time.Now()
	insertQuery := `INSERT INTO carts (cart_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4)`
	_, err = r.db.Exec(insertQuery, newCartID, userID, now, now)
	if err != nil {
		return nil, err
	}

	cart = dto.Cart{
		ID:        newCartID,
		UserID:    userID,
		CreatedAt: now,
		UpdatedAt: now,
	}

	return &cart, nil
}

func (r *neonCartRepository) GetCartItems(cartID string) ([]dto.ResCartItem, error) {
	query := `
	SELECT 
		ci.cartitem_id::text,
		ci.variant_id::text,
		pv.name AS variant_name,
		p.product_id::text,
		p.name AS product_name,
		COALESCE(img.image_url, '') AS image_url,
		pv.price::text,
		ci.quantity,
		pv.stock,
		(pv.price * ci.quantity)::text AS subtotal
	FROM cartitems ci
	JOIN productvariants pv ON ci.variant_id = pv.variant_id
	JOIN products p ON pv.product_id = p.product_id
	LEFT JOIN images img ON pv.image_id = img.image_id
	WHERE ci.cart_id = $1
	ORDER BY ci.cartitem_id ASC
	`

	rows, err := r.db.Query(query, cartID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []dto.ResCartItem
	for rows.Next() {
		var item dto.ResCartItem
		var priceStr, subtotalStr string
		err = rows.Scan(
			&item.CartItemID,
			&item.VariantID,
			&item.VariantName,
			&item.ProductID,
			&item.ProductName,
			&item.ImageURL,
			&priceStr,
			&item.Quantity,
			&item.Stock,
			&subtotalStr,
		)
		if err != nil {
			return nil, err
		}
		if priceStr != "" {
			fmt.Sscanf(priceStr, "%f", &item.Price)
		}
		if subtotalStr != "" {
			fmt.Sscanf(subtotalStr, "%f", &item.Subtotal)
		}
		items = append(items, item)
	}

	return items, nil
}

func (r *neonCartRepository) FindCartItem(cartID string, variantID string) (*dto.CartItem, error) {
	query := `SELECT cartitem_id, cart_id, variant_id, quantity FROM cartitems WHERE cart_id = $1 AND variant_id = $2`
	var item dto.CartItem
	err := r.db.QueryRow(query, cartID, variantID).Scan(&item.ID, &item.CartID, &item.VariantID, &item.Quantity)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &item, nil
}

func (r *neonCartRepository) FindCartItemByID(cartItemID string) (*dto.CartItem, error) {
	query := `SELECT cartitem_id, cart_id, variant_id, quantity FROM cartitems WHERE cartitem_id = $1`
	var item dto.CartItem
	err := r.db.QueryRow(query, cartItemID).Scan(&item.ID, &item.CartID, &item.VariantID, &item.Quantity)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &item, nil
}

func (r *neonCartRepository) AddItem(item dto.CartItem) error {
	query := `INSERT INTO cartitems (cartitem_id, cart_id, variant_id, quantity) VALUES ($1, $2, $3, $4)`
	result, err := r.db.Exec(query, item.ID, item.CartID, item.VariantID, item.Quantity)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return errors.New("cannot insert cart item")
	}

	return nil
}

func (r *neonCartRepository) UpdateQuantity(cartItemID string, quantity int) error {
	query := `UPDATE cartitems SET quantity = $1 WHERE cartitem_id = $2`
	result, err := r.db.Exec(query, quantity, cartItemID)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("cart item %s not found", cartItemID)
	}

	return nil
}

func (r *neonCartRepository) RemoveItem(cartItemID string) error {
	query := `DELETE FROM cartitems WHERE cartitem_id = $1`
	result, err := r.db.Exec(query, cartItemID)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("cart item %s not found", cartItemID)
	}

	return nil
}

func (r *neonCartRepository) ClearCart(cartID string) error {
	query := `DELETE FROM cartitems WHERE cart_id = $1`
	_, err := r.db.Exec(query, cartID)
	return err
}
