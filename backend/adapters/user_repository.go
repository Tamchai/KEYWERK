package adapters

import (
	"database/sql"
	"errors"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/jmoiron/sqlx"
)

type userRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) ports.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Get(userID string) (*core.User, error) {
	var user core.User
	query := `SELECT user_id, image, name, email, password, role, created_at, updated_at FROM users WHERE user_id = $1`

	result := r.db.QueryRow(query, userID)

	err := result.Scan(&user.ID, &user.Image, &user.Name, &user.Email, &user.Password, &user.Role, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
func (r *userRepository) Save(user core.User) error {
	query := `INSERT INTO users (user_id, image, name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	result, err := r.db.Exec(query, user.ID, user.Image, user.Name, user.Email, user.Password, user.Role, user.CreatedAt, user.UpdatedAt)
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

func (r *userRepository) Update(userID string, user core.User) error {
	return nil
}

func (r *userRepository) Delete(userID string) error {
	return nil
}

func (r *userRepository) FindEmail(email string) (*core.User, bool, error) {
	var user core.User
	query := `SELECT user_id, image, name, email, password, role, created_at, updated_at FROM users WHERE email = $1`

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
