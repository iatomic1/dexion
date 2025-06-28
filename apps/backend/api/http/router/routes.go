package router

import (
	"backend/api/http"

	"github.com/gin-gonic/gin"
)

func SetupRouter(srv *http.Server) {
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())
	router.GET("/test", Test)
	api := router.Group(srv.Config.ApiPrefixStr)
	{
		RegisterWalletRoutes(srv, api.Group("/wallets"))
		RegisterTelegramWalletRoutes(srv, api.Group("/wallets/telegram"))
		RegisterWatchlistRoutes(srv, api.Group("/watchlist"))

		RegisterDocsRoutes(api.Group("/docs"))
	}

	srv.Router = router
}

func Test(c *gin.Context) {
	http.SendSuccess(c, gin.H{
		"message": "wallet fetched successfully",
	})
}
