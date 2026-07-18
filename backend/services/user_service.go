package services

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/MaKo114/KEYWERK/core"
	"github.com/MaKo114/KEYWERK/ports"
	"github.com/golang-jwt/jwt/v5"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	Register(registerReq core.RegisterReq) error
	Login(loginReq core.LoginReq) (string, error)
}

type userService struct {
	userRepo ports.UserRepository
}

func NewUserService(userRepo ports.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) Register(registerReq core.RegisterReq) error {

	_, found, err := s.userRepo.FindEmail(registerReq.Email)
	if err != nil {
		return fmt.Errorf("check email failed: %w", err)
	}

	if found {
		return core.NewBadRequestError("email already exists")
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(registerReq.Password), 10)
	if err != nil {
		return fmt.Errorf("hashing password failed: %w", err)
	}

	user := core.User{
		ID:        uuid.NewString(),
		Image:     registerReq.Image,
		Name:      registerReq.Name,
		Email:     registerReq.Email,
		Password:  string(hashPassword),
		Role:      core.Member,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err = s.userRepo.Save(user)
	if err != nil {
		return fmt.Errorf("save user failed: %w", err)
	}

	return nil
}

func (s *userService) Login(loginReq core.LoginReq) (string, error) {
	user, found, err := s.userRepo.FindEmail(loginReq.Email)
	if err != nil {
		return "", err
	}

	if !found {
		return "", core.NewBadRequestError("invalid email or password")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password))
	if err != nil {
		return "", core.NewBadRequestError("invalid email or password")
	}

	claims := jwt.MapClaims{
		"user_id":   user.ID,
		"email":     user.Email,
		"user_role": string(user.Role),
		"exp":       time.Now().Add(time.Hour * 24).Unix(),
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	secretStr := os.Getenv("SECRET")
	if secretStr == "" {
		return "", errors.New("jwt secret key is not configured in environment")
	}
	var jwtSecret = []byte(secretStr)

	token, err := jwtToken.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return token, nil
}
