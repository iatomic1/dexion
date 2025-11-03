package router

import (
	"backend/api/http"
	"backend/api/http/handlers"
	alerts "backend/api/http/handlers/alert"
	"backend/api/http/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterAlertRoutes(srv *http.Server, router *gin.RouterGroup) {
	alertHandler := alerts.NewAlertHandler(srv)

	// Internal route for updating status
	internalAlertGroup := router.Group("")
	internalAlertGroup.Use(middleware.InternalAuthMiddleware(srv.Config))
	{
		internalAlertGroup.PATCH("/status", alertHandler.UpdateAlertStatus)
	}

	alertGroup := router
	alertGroup.GET("/channels/all", alertHandler.GetAllChannels)

	alertGroup.Use(middleware.AccessTokenMiddleware(srv.Config))
	{
		alertGroup.POST("", handlers.WithUser(alertHandler.CreateAlert))
		alertGroup.GET("", handlers.WithUser(alertHandler.GetUserAlerts))
		alertGroup.GET("/channels", handlers.WithUser(alertHandler.GetUserChannels))
		alertGroup.GET("/:id", handlers.WithUser(alertHandler.GetAlertByID))
		alertGroup.DELETE("/:id", handlers.WithUser(alertHandler.DeleteAlert))
		alertGroup.PATCH("/:id", handlers.WithUser(alertHandler.UpdateAlert))
		alertGroup.PATCH("/:id/pause", handlers.WithUser(alertHandler.PauseAlert))
		alertGroup.POST("/delete", handlers.WithUser(alertHandler.DeleteAlerts))
	}
}
