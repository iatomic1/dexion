package router

import (
	"backend/api/http"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(srv *http.Server) {
	router := gin.New()

	// CORS configuration
	corsConfig := cors.DefaultConfig()
	origins := strings.Split(srv.Config.AllowedOrigins, ",")
	if srv.Config.Environment == "development" {
		origins = append(origins, "http://localhost:3000", "http://localhost:5173")
	}
	corsConfig.AllowOrigins = origins
	corsConfig.AllowCredentials = true
	corsConfig.AddAllowHeaders("Authorization")

	router.Use(cors.New(corsConfig))
	router.Use(gin.Logger(), gin.Recovery())

	RegisterHealthRoutes(srv, router.Group("/"))

	api := router.Group(srv.Config.ApiPrefixStr)
	{
		RegisterWalletRoutes(srv, api.Group("/wallets"))
		RegisterTelegramWalletRoutes(srv, api.Group("/wallets/telegram"))
		RegisterWatchlistRoutes(srv, api.Group("/watchlist"))
		RegisterAlertRoutes(srv, api.Group("/alerts"))
		RegisterWebhookRoutes(srv, api.Group("/webhooks"))
		RegisterHodlmmRoutes(srv, api.Group("/hodlmm"))

		RegisterDocsRoutes(api.Group("/docs"))
	}

	srv.Router = router
}
