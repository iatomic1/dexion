package router

import (
	"backend/api/http"
	"backend/api/http/handlers"
	"backend/api/http/handlers/hodlmm"
	"backend/api/http/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterHodlmmRoutes(srv *http.Server, router *gin.RouterGroup) {
	hodlmmHandler := hodlmm.NewHodlmmHandler(srv)

	// Internal routes (protected by secret)
	internalGroup := router.Group("")
	internalGroup.Use(middleware.InternalAuthMiddleware(srv.Config))
	{
		internalGroup.PATCH("/alerts/status", hodlmmHandler.UpdateHodlmmAlertStatus)
	}

	// User routes (protected by JWT)
	userGroup := router.Group("")
	userGroup.Use(middleware.AccessTokenMiddleware(srv.Config))
	{
		userGroup.POST("/alerts", handlers.WithUser(hodlmmHandler.CreateHodlmmAlerts))
		userGroup.POST("/alerts/sync", handlers.WithUser(hodlmmHandler.SyncHodlmmAlerts))
		userGroup.GET("/alerts", handlers.WithUser(hodlmmHandler.GetHodlmmAlerts))
		userGroup.GET("/alerts/:id", handlers.WithUser(hodlmmHandler.GetHodlmmAlertByID))
		userGroup.PATCH("/alerts/:id", handlers.WithUser(hodlmmHandler.UpdateHodlmmAlert))
		userGroup.POST("/alerts/pause", handlers.WithUser(hodlmmHandler.PauseAllHodlmmAlerts))
		userGroup.DELETE("/alerts/:id", handlers.WithUser(hodlmmHandler.DeleteHodlmmAlert))
	}
}
