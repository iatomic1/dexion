package router

import (
	"backend/api/http"
	"backend/api/http/handlers"
	"backend/api/http/handlers/webhook"
	"backend/api/http/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterWebhookRoutes(srv *http.Server, router *gin.RouterGroup) {
	webhookHandler := webhook.NewWebhookHandler(srv)

	webhookGroup := router
	webhookGroup.Use(middleware.AccessTokenMiddleware(srv.Config))
	{
		webhookGroup.POST("", handlers.WithUser(webhookHandler.CreateWebhookConfig))
		webhookGroup.GET("", handlers.WithUser(webhookHandler.GetWebhookConfig))
		webhookGroup.PUT("", handlers.WithUser(webhookHandler.UpdateWebhookConfig))
		webhookGroup.DELETE("", handlers.WithUser(webhookHandler.DeleteWebhookConfig))
	}
}
