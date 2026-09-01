package neon

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/keywerk/internal/core/domain/dto"
	port "github.com/keywerk/internal/core/port/repository"
)

type neonAddressRepository struct {
	db *sqlx.DB
}

func NewNeonAddressRepository(db *sqlx.DB) port.AddressRepository {
	return &neonAddressRepository{db: db}
}

func (r *neonAddressRepository) Save(addr dto.Address) error {
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
		created_at) 
	VALUES 
		($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`

	result, err := r.db.Exec(query,
		addr.ID,
		addr.UserID,
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
		return errors.New("cannot insert address")
	}

	return nil
}

func (r *neonAddressRepository) FindByUserID(userID string) ([]dto.Address, error) {
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
	FROM addresses
	WHERE user_id = $1
	ORDER BY is_default DESC, created_at DESC
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var addresses []dto.Address
	for rows.Next() {
		var addr dto.Address
		var title, receiverName, phone, line1, line2, district, province, postalCode sql.NullString

		err = rows.Scan(
			&addr.ID,
			&addr.UserID,
			&title,
			&receiverName,
			&phone,
			&line1,
			&line2,
			&district,
			&province,
			&postalCode,
			&addr.IsDefault,
			&addr.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		addr.Title = title.String
		addr.ReceiverName = receiverName.String
		addr.PhoneNumber = phone.String
		addr.AddressLine1 = line1.String
		addr.AddressLine2 = line2.String
		addr.District = district.String
		addr.Province = province.String
		addr.PostalCode = postalCode.String

		addresses = append(addresses, addr)
	}

	return addresses, nil
}

func (r *neonAddressRepository) FindByID(id string) (*dto.Address, error) {
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
	FROM addresses
	WHERE address_id = $1
	`

	var addr dto.Address
	var title, receiverName, phone, line1, line2, district, province, postalCode sql.NullString

	err := r.db.QueryRow(query, id).Scan(
		&addr.ID,
		&addr.UserID,
		&title,
		&receiverName,
		&phone,
		&line1,
		&line2,
		&district,
		&province,
		&postalCode,
		&addr.IsDefault,
		&addr.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	addr.Title = title.String
	addr.ReceiverName = receiverName.String
	addr.PhoneNumber = phone.String
	addr.AddressLine1 = line1.String
	addr.AddressLine2 = line2.String
	addr.District = district.String
	addr.Province = province.String
	addr.PostalCode = postalCode.String

	return &addr, nil
}

func (r *neonAddressRepository) Update(addr dto.Address) error {
	query := `
	UPDATE addresses
	SET 
		title = $1,
		receiver_name = $2,
		phone_number = $3,
		address_line1 = $4,
		address_line2 = $5,
		district = $6,
		province = $7,
		postal_code = $8,
		is_default = $9
	WHERE address_id = $10 AND user_id = $11
	`

	result, err := r.db.Exec(
		query,
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
		addr.UserID,
	)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("address %s not found or no change", addr.ID)
	}

	return nil
}

func (r *neonAddressRepository) Delete(id string) error {
	query := `DELETE FROM addresses WHERE address_id = $1`
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return fmt.Errorf("address %s not found", id)
	}

	return nil
}

func (r *neonAddressRepository) ClearDefault(userID string) error {
	query := `UPDATE addresses SET is_default = false WHERE user_id = $1`
	_, err := r.db.Exec(query, userID)
	return err
}
