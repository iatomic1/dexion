package middleware

import (
	"backend/api/http"
	"backend/config"
	"backend/internal/db/repository"
	"backend/pkg/jwt"
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func AccessTokenMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			http.SendUnauthorized(c, nil, http.WithMessage("Missing authentication token"))
			c.Abort()
			return
		}

		fmt.Println(tokenString)

		tokenParts := strings.Split(tokenString, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			http.SendUnauthorized(c, errors.New("Invalid authentication token"), http.WithMessage("Invalid authentication token"))
			c.Abort()
			return
		}

		tokenString = tokenParts[1]
		claims, err := jwt.ValidateAccessToken(tokenString, cfg)
		fmt.Println(claims)
		if err != nil {
			switch err {
			case jwt.ErrTokenExpired:
				http.SendUnauthorized(c, err, http.WithMessage("Token has expired"))
			case jwt.ErrInvalidTokenType:
				http.SendUnauthorized(c, err, http.WithMessage("Invalid token type"))
			default:
				http.SendUnauthorized(c, err, http.WithMessage("Invalid"))
			}
			c.Abort()
			return
		}

		userId, err := jwt.ExtractDataFromToken(claims, false)
		if err != nil {
			http.SendUnauthorized(c, err)
			c.Abort()
			return
		}
		fmt.Println("final", userId)
		c.Set("userId", userId)
	}
}

func RefreshTokenMiddleware(srv *http.Server) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		fmt.Println("Authorization Header:", tokenString)

		if tokenString == "" {
			fmt.Println("Missing token")
			http.SendUnauthorized(c, nil, http.WithMessage("Missing authentication token"))
			c.Abort()
			return
		}

		tokenParts := strings.Split(tokenString, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			fmt.Println("Invalid token format:", tokenParts)
			http.SendUnauthorized(c, errors.New("Invalid authentication token"), http.WithMessage("Invalid authentication token"))
			c.Abort()
			return
		}

		tokenString = tokenParts[1]
		fmt.Println("Token to validate:", tokenString)

		claims, err := jwt.ValidateRefreshToken(tokenString, srv.Config)
		if err != nil {
			fmt.Println("Token validation failed:", err)
			switch err {
			case jwt.ErrTokenExpired:
				http.SendUnauthorized(c, err, http.WithMessage("Refresh token has expired"))
			case jwt.ErrInvalidTokenType:
				http.SendUnauthorized(c, err, http.WithMessage("Invalid refresh token"))
			default:
				http.SendUnauthorized(c, err, http.WithMessage("Invalid token"))
			}
			c.Abort()
			return
		}

		fmt.Println("Token claims:", claims)

		jti, ok := claims["jti"].(string)
		if !ok {
			fmt.Println("Missing JTI in token")
			http.SendUnauthorized(c, errors.New("refresh token ID not found"), http.WithMessage("Invalid refresh token"))
			c.Abort()
			return
		}

		c.Set("refreshTokenId", jti)

		ctx := context.Background()
		tokenID, err := uuid.Parse(jti)
		if err != nil {
			fmt.Println("Invalid JTI format:", jti)
			http.SendUnauthorized(c, err, http.WithMessage("Invalid refresh token ID format"))
			c.Abort()
			return
		}

		tx, err := srv.DB.Begin(ctx)
		if err != nil {
			fmt.Println("Failed to begin DB transaction:", err)
			http.SendInternalServerError(c, err)
			c.Abort()
			return
		}
		defer tx.Rollback(ctx)

		repo := repository.New(tx)

		exists, err := repo.RefreshTokenExists(ctx, tokenID)
		if err != nil {
			fmt.Println("Error checking token existence:", err)
			http.SendInternalServerError(c, err)
			c.Abort()
			return
		}

		if !exists {
			fmt.Println("Token not found or revoked:", tokenID)
			http.SendUnauthorized(c, errors.New("refresh token has been revoked or already used"),
				http.WithMessage("Invalid refresh token"))
			c.Abort()
			return
		}

		refreshTokenId, err := jwt.ExtractDataFromToken(claims, true)
		if err != nil {
			fmt.Println("Failed to extract data from token:", err)
			http.SendUnauthorized(c, err)
			c.Abort()
			return
		}

		id, err := uuid.Parse(refreshTokenId)
		if err != nil {
			fmt.Println("Failed to parse id:", err)
			http.SendUnauthorized(c, err)
			c.Abort()
			return
		}

		userID, err := repo.GetRefreshTokenUserID(ctx, id)
		fmt.Println("Failed to get userid", err)
		if err != nil {
			c.Abort()
			return
		}

		fmt.Printf("Authenticated user: ID=%s\n", userID)
		c.Set("userId", userID.String())
	}
}
