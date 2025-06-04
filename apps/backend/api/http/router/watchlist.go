package router

import (
	"backend/api/http"
	"backend/api/http/handlers/watchlist"
	"backend/api/http/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterWatchlistRoutes(srv *http.Server, router *gin.RouterGroup) {
	watchlistHandler := watchlist.NewWatchlistHandler(srv)

	// Protected wallet routes requiring authentication
	watchlistGroup := router

	// watchlistGroup.GET("/all", watchlistHandler.GetAllWallets)
	// watchlistGroup.GET("/:address/watchers", watchlistHandler.GetWalletWatchers)
	watchlistGroup.Use(middleware.AccessTokenMiddleware(srv.Config))
	{
		watchlistGroup.POST("", watchlistHandler.CreateWatchlist)
		watchlistGroup.GET("", watchlistHandler.GetUserWatchlists)
		// watchlistGroup.PATCH("/:id", watchlistHandler.UpdateWatchlist)
		watchlistGroup.DELETE("/:id", watchlistHandler.DeleteWatchlist)
	}
}
