package neon

import (
	"errors"

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
		return errors.New("errors not insert address")
	}

	return nil
}

func (r *neonAddressRepository) FindAll() ([]dto.Address, error) {
	return nil, nil
}

func (r *neonAddressRepository) Update(dto.Address) error {
	return nil
}

func (r *neonAddressRepository) Delete(id string) error {
	return nil
}
