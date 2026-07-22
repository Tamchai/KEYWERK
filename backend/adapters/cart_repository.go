package adapters

import (
	"database/sql"
	"errors"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/jmoiron/sqlx"
)

type cartRepository struct {
	db *sqlx.DB
}

func NewCartRepository(db *sqlx.DB) ports.CartRepository {
	return &cartRepository{db: db}
}

func (r *cartRepository) SaveCart(cart *core.Cart) error {

	query := `
	insert into carts (cart_id, user_id, updated_at, created_at) values ($1, $2, $3, $4)
	`

	_, err := r.db.Exec(query, cart.CartID, cart.UserID, cart.UpdatedAt, cart.CreatedAt)
	if err != nil {
		return err
	}

	return nil
}
func (r *cartRepository) FindByUserID(userID string) (*core.Cart, bool, error) {

	var cart core.Cart

	query := `
	select cart_id, user_id, updated_at, created_at from carts where user_id = $1
	`

	err := r.db.QueryRow(query, userID).Scan(&cart.CartID, &cart.UserID, &cart.CreatedAt, &cart.UpdatedAt)
	if err != nil {
		if errors.Is(sql.ErrNoRows, err) {
			return nil, false, nil
		}
		return nil, false, err
	}

	return &cart, true, nil
}
