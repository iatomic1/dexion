package health

import (
	"backend/api/http"
	nethttp "net/http"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
	srv *http.Server
}

func NewHealthHandler(srv *http.Server) *HealthHandler {
	return &HealthHandler{srv: srv}
}

func (h *HealthHandler) HealthCheck(c *gin.Context) {
	ctx := c.Request.Context()

	dbErr := h.srv.DB.Ping(ctx)
	rdbErr := h.srv.RDB.Ping(ctx).Err()

	if dbErr != nil || rdbErr != nil {
		response := gin.H{"status": "unhealthy"}
		if dbErr != nil {
			response["database"] = dbErr.Error()
		}
		if rdbErr != nil {
			response["redis"] = rdbErr.Error()
		}
		c.JSON(nethttp.StatusServiceUnavailable, response)
		return
	}

	c.JSON(nethttp.StatusOK, gin.H{
		"status": "ok",
	})
}
