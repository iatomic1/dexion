package domain

import (
	"backend/internal/db/repository"
	"backend/pkg/jwt"

	"github.com/google/uuid"
)

const (
	UniqueViolation           = "23505"
	UserCreated               = "User Created Successfully"
	ErrEmailAlreadyExist      = "User with this email already exists"
	ErrUsernameAlreadyExist   = "User with this username already exists"
	ErrInvalidEmailOrPassword = "Invalid email or password"
	LoginSuccessful           = "Login Successful"
	ErrGeneratingTokens       = "Error generating token pair"
	TokensRefreshed           = "Tokens Refreshed successfully"
)

type AuthResponse struct {
	jwt.TokenPair
	UserID string
}

type RegisterRequest struct {
	repository.RegisterUserParams
}

type RefreshTokenResponse struct {
	jwt.TokenPair
}

type EmailID struct {
	Email     string `json:"email"`
	ID        string `json:"id"`
	ProfileID string `json:"profileId"`
} // @name EmailID

func ParseIDs(id string) (uuid.UUID, error) {
	userId, err := uuid.Parse(id)
	if err != nil {
		return uuid.Nil, err
	}

	return userId, nil
}
