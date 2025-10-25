package handlers

import (
	"backend/internal/domain"

	"github.com/gin-gonic/gin"
)

// WithUser is a middleware that extracts the user ID from the context and passes it to the handler.
// It simplifies handlers by removing the need to manually get the user ID and handle errors.
func WithUser(handler func(c *gin.Context, userID string)) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := domain.GetUserIDFromContext(c)
		if err != nil {
			// GetUserIDFromContext handles the error response, so we just need to return.
			return
		}
		handler(c, userID)
	}
}
