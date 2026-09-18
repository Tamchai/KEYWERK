package service

import (
	"database/sql"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
	port "github.com/keywerk/internal/core/port/repository"
	"github.com/spf13/viper"
	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	Login(dto.ReqLogin) (string, error)
	Register(dto.ReqRegister) error
	GetProfile(userID string) (*dto.ResProfile, error)
	UpdateProfile(userID string, req dto.ReqUpdateProfile) error
}

type userService struct {
	userRepo port.UserRepository
}

func NewUserService(userRepo port.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) GetProfile(userID string) (*dto.ResProfile, error) {
	if _, err := uuid.Parse(userID); err != nil {
		return nil, errs.BadRequest("invalid user id", err)
	}

	user, found, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errs.Internal("cannot get profile", err)
	}
	if !found {
		return nil, errs.NotFound("user not found", nil)
	}

	return &dto.ResProfile{
		ID: user.ID, Image: user.Image, Name: user.Name, Email: user.Email, Role: user.Role,
	}, nil
}

func (s *userService) UpdateProfile(userID string, req dto.ReqUpdateProfile) error {
	if _, err := uuid.Parse(userID); err != nil {
		return errs.BadRequest("invalid user id", err)
	}
	if req.Name == nil && req.Image == nil {
		return errs.BadRequest("name or image is required", nil)
	}
	if req.Name != nil {
		trimmed := strings.TrimSpace(*req.Name)
		if trimmed == "" || len([]rune(trimmed)) > 120 {
			return errs.BadRequest("name must be between 1 and 120 characters", nil)
		}
		req.Name = &trimmed
	}
	if req.Image != nil {
		trimmed := strings.TrimSpace(*req.Image)
		if len(trimmed) > 2048 {
			return errs.BadRequest("image URL is too long", nil)
		}
		req.Image = &trimmed
	}

	if err := s.userRepo.UpdateProfile(userID, req.Name, req.Image); err != nil {
		if err == sql.ErrNoRows {
			return errs.NotFound("user not found", nil)
		}
		return errs.Internal("cannot update profile", err)
	}
	return nil
}

func (s *userService) Login(reqLogin dto.ReqLogin) (string, error) {
	reqLogin.Email = strings.ToLower(strings.TrimSpace(reqLogin.Email))
	user, found, err := s.userRepo.FindEmail(reqLogin.Email)
	if err != nil {
		return "", errs.Internal("cannot authenticate user", err)
	}

	if !found {
		return "", errs.Unauthorized("invalid email or password", nil)
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(reqLogin.Password))
	if err != nil {
		return "", errs.Unauthorized("invalid email or password", nil)
	}

	claims := jwt.MapClaims{
		"user_id":   user.ID,
		"email":     user.Email,
		"user_role": string(user.Role),
		"exp":       time.Now().Add(time.Hour * 24 * 7).Unix(),
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	secretStr := viper.GetString("app.secret")
	if secretStr == "" {
		return "", errs.Internal("authentication is not configured", nil)
	}
	var jwtSecret = []byte(secretStr)

	token, err := jwtToken.SignedString(jwtSecret)
	if err != nil {
		return "", errs.Internal("cannot create authentication token", err)
	}

	return token, nil
}

func (s *userService) Register(reqRegister dto.ReqRegister) error {
	reqRegister.Email = strings.ToLower(strings.TrimSpace(reqRegister.Email))
	_, found, err := s.userRepo.FindEmail(reqRegister.Email)
	if err != nil {
		return errs.Internal("cannot register user", err)
	}

	if found {
		return errs.BadRequest("email already exists", nil)
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(reqRegister.Password), 10)
	if err != nil {
		return errs.Internal("cannot register user", err)
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
		if isUniqueViolation(err) {
			return errs.Conflict("email already exists", err)
		}
		return errs.Internal("cannot register user", err)
	}

	return nil
}
