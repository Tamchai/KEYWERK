package neon

import (
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/keywerk/internal/core/domain/dto"
	port "github.com/keywerk/internal/core/port/repository"
)

type neonUserRepository struct {
	db *sqlx.DB
}

func NewNeonUserRepository(db *sqlx.DB) port.UerRepository {
	return &neonUserRepository{db: db}
}

func (r *neonUserRepository) Save(user dto.User) error {

	query := `
	INSERT INTO users (user_id, image, name, email, password, role, created_at, updated_at) 
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	result, err := r.db.Exec(
		query,
		user.ID,
		user.Image,
		user.Name,
		user.Email,
		user.Password,
		user.Role,
		user.CreatedAt,
		user.UpdatedAt)

	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected <= 0 {
		return errors.New("can't insert user information")
	}

	return nil
}

func (r *neonUserRepository) FindEmail(email string) (*dto.User, bool, error) {
	var user dto.User
	query := `
	SELECT user_id, image, name, email, password, role, created_at, updated_at 
	FROM users 
	WHERE email = $1`

	result := r.db.QueryRow(query, email)

	err := result.Scan(&user.ID, &user.Image, &user.Name, &user.Email, &user.Password, &user.Role, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, false, nil
		}

		return nil, false, err
	}

	return &user, true, nil
}
