package adapters

import (
	"database/sql"
	"errors"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/jmoiron/sqlx"
)

type cartItemRepository struct {
	db *sqlx.DB
}

func NewCartItemRepository(db *sqlx.DB) ports.CartItemRepository {
	return &cartItemRepository{db: db}
}

func (r *cartItemRepository) CreateCartItem(cartItem core.CartItem) error {

	query := `insert into cartitems (cartitem_id, cart_id, variant_id, quantity) values ($1, $2, $3, $4)`

	_, err := r.db.Exec(query, cartItem.CartItemID, cartItem.CartID, cartItem.VariantID, cartItem.Quantity)

	if err != nil {
		return err
	}

	return nil
}

func (r *cartItemRepository) FindItemInCart(cartID string, variantID string) (*core.CartItem, bool, error) {

	query := `select cartitem_id, cart_id, variant_id, quantity from cartitems where cart_id = $1 and variant_id = $2`

	var item core.CartItem

	err := r.db.QueryRow(query, cartID, variantID).Scan(&item.CartItemID, &item.CartID, &item.VariantID, &item.Quantity)
	if err != nil {
		if errors.Is(sql.ErrNoRows, err) {
			return nil, false, nil
		}
		return nil, false, err
	}

	return &item, true, nil
}

func (r *cartItemRepository) UpdateItemInCart(item *core.CartItem) error {

	query := `update cartitems set cartitem_id = $1, cart_id = $2, variant_id = $3, quantity = $4 where variant_id = $5`
	_, err := r.db.Exec(query, item.CartItemID, item.CartID, item.VariantID, item.Quantity, item.VariantID)

	if err != nil {
		return err
	}

	return nil
}

func (r *cartItemRepository) DeleteItemInCart(variantID string) error {

	query := `delete from cartitems where variant_id = $1`

	_, err := r.db.Exec(query, variantID)
	if err != nil {
		return err
	}

	return nil
}

func (r *cartItemRepository) GetItemInCart(cartID string) ([]core.CartItem, error) {

	query := `
	select 
		cartitem_id, cart_id, variant_id, quantity 
	from 
		cartitems
	where cart_id = $1
	`

	rows, err := r.db.Query(query, cartID)
	if err != nil {
		return nil, err
	}

	var items []core.CartItem

	for rows.Next() {
		var i core.CartItem

		err = rows.Scan(&i.CartItemID, &i.CartID, &i.VariantID, &i.Quantity)
		if err != nil {
			return nil, err
		}

		items = append(items, i)
	}

	return items, nil
}

func (r *cartItemRepository) DeleteAllByCartID(tx *sqlx.Tx, cartID string) error {

	query := `delete from cartitems where cart_id = $1`

	_, err := tx.Exec(query, cartID)
	if err != nil {
		return err
	}

	return nil
}
