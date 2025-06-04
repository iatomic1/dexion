package middleware

import (
	"backend/api/http"
	"backend/config"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc/v2"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var (
	jwks               *keyfunc.JWKS
	ErrInvalidIssuer   = errors.New("invalid issuer")
	ErrInvalidAudience = errors.New("invalid audience")
)

// setupJWKS initializes the JWKS for JWT verification
func setupJWKS(betterAuthBaseURL string) error {
	jwksURL := fmt.Sprintf("%s/api/auth/jwks", betterAuthBaseURL)

	options := keyfunc.Options{
		RefreshInterval: 24 * time.Hour, // Cache for 24 hours as recommended
		RefreshTimeout:  10 * time.Second,
	}

	var err error
	jwks, err = keyfunc.Get(jwksURL, options)
	if err != nil {
		return fmt.Errorf("failed to get JWKS: %w", err)
	}

	return nil
}

// verifyBetterAuthJWT verifies a JWT token from better-auth
func verifyBetterAuthJWT(tokenString string, cfg *config.Config) (*jwt.Token, error) {
	// Initialize JWKS if not already done
	if jwks == nil {
		if err := setupJWKS(cfg.FrontendURL); err != nil {
			return nil, err
		}
	}

	// Parse and verify the token
	token, err := jwt.Parse(tokenString, jwks.Keyfunc)
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	// Validate claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	// Validate issuer
	if iss, ok := claims["iss"].(string); !ok || iss != cfg.FrontendURL {
		return nil, ErrInvalidIssuer
	}

	// Validate audience
	if aud, ok := claims["aud"].(string); !ok || aud != cfg.FrontendURL {
		return nil, ErrInvalidAudience
	}

	return token, nil
}

// BetterAuthJWTMiddleware validates JWT tokens from better-auth
func BetterAuthJWTMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			http.SendUnauthorized(c, nil, http.WithMessage("Missing authentication token"))
			c.Abort()
			return
		}

		tokenParts := strings.Split(tokenString, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			http.SendUnauthorized(c, errors.New("invalid authentication token"), http.WithMessage("Invalid authentication token"))
			c.Abort()
			return
		}

		tokenString = tokenParts[1]

		// Verify the JWT token
		token, err := verifyBetterAuthJWT(tokenString, cfg)
		if err != nil {
			http.SendUnauthorized(c, err, http.WithMessage("Token validation failed"))
			c.Abort()
			return
		}

		// Extract user information from claims
		claims := token.Claims.(jwt.MapClaims)

		// Based on your JWT payload, extract user data
		userID, ok := claims["id"].(string)
		if !ok {
			// Fallback to sub if id is not present
			if sub, subOk := claims["sub"].(string); subOk {
				userID = sub
			} else {
				http.SendUnauthorized(c, errors.New("user ID not found in token"), http.WithMessage("Invalid token payload"))
				c.Abort()
				return
			}
		}

		c.Set("userId", userID)

		if name, ok := claims["name"].(string); ok {
			c.Set("userName", name)
		}

		if email, ok := claims["email"].(string); ok {
			c.Set("userEmail", email)
		}

		if emailVerified, ok := claims["emailVerified"].(bool); ok {
			c.Set("userEmailVerified", emailVerified)
		}

		if image, ok := claims["image"].(string); ok && image != "null" {
			c.Set("userImage", image)
		}

		c.Next()
	}
}

func AccessTokenMiddleware(cfg *config.Config) gin.HandlerFunc {
	return BetterAuthJWTMiddleware(cfg)
}
