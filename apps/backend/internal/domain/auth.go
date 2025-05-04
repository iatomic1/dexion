package domain

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"backend/pkg/jwt"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
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
	ErrTelegramUserNotFound   = "telegram user not found"

	TokensRefreshed = "Tokens Refreshed successfully"
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

func GetUserIDFromContext(c *gin.Context) (uuid.UUID, error) {
	userID, exists := c.Get("userId")
	if !exists {
		http.SendUnauthorized(c, nil, http.WithMessage("User ID not found in context"))
		return uuid.Nil, errors.New("user id not found")
	}

	userIDStr, ok := userID.(string)
	if !ok {
		http.SendInternalServerError(c, nil, http.WithMessage("Invalid user ID format"))
		return uuid.Nil, errors.New("invalid user ID type")
	}

	parsedID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to parse user ID"))
		return uuid.Nil, fmt.Errorf("parse UUID: %w", err)
	}

	return parsedID, nil
}
