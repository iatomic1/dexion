package router

import (
	"backend/api/http"
	"backend/api/http/handlers"
	"backend/api/http/handlers/wallet"
	"backend/api/http/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterWalletRoutes(srv *http.Server, router *gin.RouterGroup) {
	walletHandler := wallet.NewAppWalletHandler(srv)

	// Protected wallet routes requiring authentication
	walletGroup := router

	walletGroup.GET("/all", walletHandler.GetAllWallets)
	walletGroup.GET("/:address/watchers", walletHandler.GetWalletWatchers)
	walletGroup.Use(middleware.AccessTokenMiddleware(srv.Config))
	{
		walletGroup.POST("", handlers.WithUser(walletHandler.TrackWallet))
		walletGroup.GET("", handlers.WithUser(walletHandler.GetTrackedWallets))
		walletGroup.PATCH("/:address", handlers.WithUser(walletHandler.UpdateWalletPreferences))
		walletGroup.DELETE("/:address", handlers.WithUser(walletHandler.UntrackWallet))
	}
}
