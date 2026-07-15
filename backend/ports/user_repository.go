package ports

import "github.com/MaKo114/KEYWERK/core"

type UserRepository interface {
	Get(userID string) (*core.User, error)
	Save(user core.User) error
	Update(userID string, user core.User) error
	Delete(userID string) error

	FindEmail(email string) (*core.User, bool, error)
}
