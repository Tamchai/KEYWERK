package adapters

import (
	"errors"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/jmoiron/sqlx"
)

type addressRepository struct {
	db *sqlx.DB
}

func NewAddressRepository(db *sqlx.DB) ports.AddressRepository {
	return &addressRepository{db: db}
}

func (r *addressRepository) Save(addr *core.Address, userID string) error {
	query := `
	INSERT INTO addresses 
		(address_id, 
		user_id, 
		title, 
		receiver_name, 
		phone_number, 
		address_line1, 
		address_line2, 
		district, 
		province, 
		postal_code, 
		is_default, 
		created_at
		) 
	VALUES 
		($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`

	result, err := r.db.Exec(query,
		addr.ID,
		userID,
		addr.Title,
		addr.ReceiverName,
		addr.PhoneNumber,
		addr.AddressLine1,
		addr.AddressLine2,
		addr.District,
		addr.Province,
		addr.PostalCode,
		addr.IsDefault,
		addr.CreatedAt,
	)

	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return errors.New("errors not insert address")
	}

	return nil
}

func (r *addressRepository) GetByUserID(userID string) ([]core.Address, error) {

	var addresses []core.Address

	query := `
	SELECT 
		address_id, 
		user_id, 
		title, 
		receiver_name, 
		phone_number, 
		address_line1, 
		address_line2, 
		district, 
		province, 
		postal_code, 
		is_default, 
		created_at 
	FROM 
		addresses
	WHERE 
		user_id = $1
	ORDER BY
		is_default DESC,
		created_at DESC
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var addr core.Address
		err = rows.Scan(
			&addr.ID,
			&addr.UserID,
			&addr.Title,
			&addr.ReceiverName,
			&addr.PhoneNumber,
			&addr.AddressLine1,
			&addr.AddressLine2,
			&addr.District,
			&addr.Province,
			&addr.PostalCode,
			&addr.IsDefault,
			&addr.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		addresses = append(addresses, addr)
	}

	return addresses, nil
}

func (r *addressRepository) Update(addr *core.Address, userID string) error {
	query := `
	UPDATE addresses SET
		title = $1,
		receiver_name = $2,
		phone_number = $3,
		address_line1 = $4,
		address_line2 = $5,
		district = $6,
		province = $7,
		postal_code = $8,
		is_default = $9
	WHERE
		address_id = $10 AND user_id = $11
	`

	result, err := r.db.Exec(query,
		addr.Title,
		addr.ReceiverName,
		addr.PhoneNumber,
		addr.AddressLine1,
		addr.AddressLine2,
		addr.District,
		addr.Province,
		addr.PostalCode,
		addr.IsDefault,
		addr.ID,
		userID,
	)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return errors.New("address not found")
	}

	return nil
}

func (r *addressRepository) Delete(addressID, userID string) error {
	query := `DELETE FROM addresses WHERE address_id = $1 AND user_id = $2`

	result, err := r.db.Exec(query, addressID, userID)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return errors.New("address not found")
	}

	return nil
}

func (r *addressRepository) ClearDefault(userID string) error {
	query := `UPDATE addresses SET is_default = false WHERE user_id = $1 AND is_default = true`

	_, err := r.db.Exec(query, userID)
	return err
}

func (r *addressRepository) GetAddresIsDefault(userId string) (*core.Address, error) {
	var address core.Address

	query := `select address_id, 
		user_id, 
		title, 
		receiver_name, 
		phone_number, 
		address_line1, 
		address_line2, 
		district, 
		province, 
		postal_code, 
		is_default, 
		created_at  from addresses where user_id = $1 and is_default is true`

	err := r.db.QueryRow(query, userId).Scan(
		&address.ID,
		&address.UserID,
		&address.Title,
		&address.ReceiverName,
		&address.PhoneNumber,
		&address.AddressLine1,
		&address.AddressLine2,
		&address.District,
		&address.Province,
		&address.PostalCode,
		&address.IsDefault,
		&address.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &address, nil
}
