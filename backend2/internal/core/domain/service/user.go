package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/dto"
	port "github.com/keywerk/internal/core/port/repository"
	"github.com/spf13/viper"
	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	Login(dto.ReqLogin) (string, error)
	Register(dto.ReqRegister) error
}

type userService struct {
	userRepo port.UerRepository
}

func NewUserService(userRepo port.UerRepository) UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) Login(reqLogin dto.ReqLogin) (string, error) {

	user, found, err := s.userRepo.FindEmail(reqLogin.Email)
	if err != nil {
		return "", err
	}

	if !found {
		return "", errors.New("invalid email or password")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(reqLogin.Password))
	if err != nil {
		return "", errors.New("invalid email or password")
	}

	claims := jwt.MapClaims{
		"user_id":   user.ID,
		"email":     user.Email,
		"user_role": string(user.Role),
		"exp":       time.Now().Add(time.Hour * 24).Unix(),
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	secretStr := viper.GetString("app.secret")
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

func (s *userService) Register(reqRegister dto.ReqRegister) error {

	_, found, err := s.userRepo.FindEmail(reqRegister.Email)
	if err != nil {
		return fmt.Errorf("check email failed: %w", err)
	}

	if found {
		return errors.New("email already exists")
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(reqRegister.Password), 10)
	if err != nil {
		return fmt.Errorf("hashing password failed: %w", err)
	}

	user := dto.User{
		ID:        uuid.NewString(),
		Image:     reqRegister.Image,
		Name:      reqRegister.Name,
		Email:     reqRegister.Email,
		Password:  string(hashPassword),
		Role:      dto.Member,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err = s.userRepo.Save(user)
	if err != nil {
		return fmt.Errorf("save user failed: %w", err)
	}

	return nil
}
