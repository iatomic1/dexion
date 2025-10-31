package domain

import (
	"backend/api/http"
	"errors"

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

// GetUserIDFromContext extracts the user ID from the Gin context.
// If not found or invalid, it sends the appropriate HTTP response and returns an error.
func GetUserIDFromContext(c *gin.Context) (string, error) {
	userID, exists := c.Get("userId")
	if !exists {
		http.SendUnauthorized(c, nil, http.WithMessage("User ID not found in context"))
		return "", errors.New("user id not found")
	}

	userIDStr, ok := userID.(string)
	if !ok {
		http.SendInternalServerError(c, nil, http.WithMessage("Invalid user ID format"))
		return "", errors.New("invalid user id type")
	}

	return userIDStr, nil
}
