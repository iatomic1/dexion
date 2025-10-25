package router

import (
	"backend/api/http"
	"backend/api/http/handlers/health"

	"github.com/gin-gonic/gin"
)

func RegisterHealthRoutes(srv *http.Server, router *gin.RouterGroup) {
	healthHandler := health.NewHealthHandler(srv)
	router.GET("/healthz", healthHandler.HealthCheck)
}
