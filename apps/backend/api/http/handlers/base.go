package handlers

import (
	"backend/api/http"
	"backend/internal/domain"

	"github.com/gin-gonic/gin"
)

// WithUser is a middleware that extracts the user ID from the context and passes it to the handler.
// It simplifies handlers by removing the need to manually get the user ID and handle errors.
func WithUser(handler func(c *gin.Context, userID string)) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUserID, err := domain.GetUserIDFromContext(c)
		if err != nil {
			return
		}

		if paramUserID := c.Param("userId"); paramUserID != "" && paramUserID != authUserID {
			http.SendForbidden(c, nil, http.WithMessage("user ID mismatch"))
			return
		}

		handler(c, authUserID)
	}
}
