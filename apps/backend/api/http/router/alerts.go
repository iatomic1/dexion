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
	alertGroup.GET("/channels", alertHandler.GetAllChannels)

	alertGroup.Use(middleware.AccessTokenMiddleware(srv.Config))
	{
		alertGroup.POST("", alertHandler.CreateAlert)
		alertGroup.GET("", alertHandler.GetUserAlerts)
		alertGroup.GET("/:id", alertHandler.GetAlertByID)
		alertGroup.DELETE("/:id", alertHandler.DeleteAlert)
		alertGroup.PATCH("/:id", alertHandler.UpdateAlert)
	}
}
