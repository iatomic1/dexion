package router

import (
	"backend/api/http"
	alerts "backend/api/http/handlers/alert"
	"backend/api/http/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterAlertRoutes(srv *http.Server, router *gin.RouterGroup) {
	alertHandler := alerts.NewAlertHandler(srv)

	// Protected wallet routes requiring authentication
	alertGroup := router

	alertGroup.Use(middleware.AccessTokenMiddleware(srv.Config))
	{
		alertGroup.POST("", alertHandler.CreateAlert)
		alertGroup.GET("", alertHandler.GetUserAlerts)
		alertGroup.DELETE("/:id", alertHandler.DeleteAlert)
		alertGroup.GET("/:id", alertHandler.GetAlertByID)
	}
}
