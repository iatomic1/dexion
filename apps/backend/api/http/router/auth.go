package router

import (
	"backend/api/http"
	"backend/api/http/handlers/auth"
	"backend/api/http/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(srv *http.Server, router *gin.RouterGroup) {
	authHandler := auth.NewAuthHandler(srv)
	authGroup := router
	authGroup.POST("/login", authHandler.LoginUser)
	authGroup.POST("/signup", authHandler.RegisterUser)

	authGroup.Use(middleware.RefreshTokenMiddleware(srv))
	{
		authGroup.GET("/refresh", authHandler.RefreshToken)
	}
}
