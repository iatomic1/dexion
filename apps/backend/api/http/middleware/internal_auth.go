package middleware

import (
	"backend/api/http"
	"backend/config"
	"errors"

	"github.com/gin-gonic/gin"
)

func InternalAuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		secret := c.GetHeader("X-Internal-Secret")
		if secret == "" {
			http.SendUnauthorized(c, errors.New("missing internal secret"), http.WithMessage("Missing internal secret"))
			c.Abort()
			return
		}

		if secret != cfg.InternalSecret {
			http.SendForbidden(c, errors.New("invalid internal secret"), http.WithMessage("Invalid internal secret"))
			c.Abort()
			return
		}

		c.Next()
	}
}
