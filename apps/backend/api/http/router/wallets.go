package router

import (
	"backend/api/http"
	"backend/api/http/handlers/wallet"
	"backend/api/http/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterWalletRoutes(srv *http.Server, router *gin.RouterGroup) {
	walletHandler := wallet.NewAppWalletHandler(srv)

	// Protected wallet routes requiring authentication
	walletGroup := router

	walletGroup.GET("/all", walletHandler.GetAllWallets)
	walletGroup.Use(middleware.AccessTokenMiddleware(srv.Config))
	{
		walletGroup.POST("", walletHandler.TrackWallet)
		walletGroup.GET("", walletHandler.GetTrackedWallets)
		walletGroup.PATCH("/:address", walletHandler.UpdateWalletPreferences)
		walletGroup.DELETE("/:address", walletHandler.UntrackWallet)
	}
}
