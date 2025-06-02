package router

import (
	"backend/api/http"
	"fmt"

	"github.com/gin-gonic/gin"
)

func SetupRouter(srv *http.Server) {
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())
	router.GET("/test", Test)
	// Create the base api group
	api := router.Group(srv.Config.ApiPrefixStr)
	{
		fmt.Println("registering routes")
		RegisterAuthRoutes(srv, api.Group("/auth"))
		RegisterWalletRoutes(srv, api.Group("/wallets"))
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
