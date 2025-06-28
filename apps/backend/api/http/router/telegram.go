package router

import (
	"backend/api/http"
	"backend/api/http/handlers/wallet"

	"github.com/gin-gonic/gin"
)

func RegisterTelegramWalletRoutes(srv *http.Server, router *gin.RouterGroup) {
	walletHandler := wallet.NewTelegramWalletHandler(srv)

	walletGroup := router
	{
		walletGroup.POST("", walletHandler.TrackWalletTelegram)
		walletGroup.GET("/:chat_id", walletHandler.GetTrackedWalletsTelegram)
	}
}
