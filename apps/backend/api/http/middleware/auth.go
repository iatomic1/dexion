package middleware

import (
	"backend/api/http"
	"backend/config"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/MicahParks/keyfunc/v2"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rs/zerolog/log"
)

var (
	jwks               *keyfunc.JWKS
	jwksOnce           sync.Once
	jwksInitErr        error
	ErrInvalidIssuer   = errors.New("invalid issuer")
	ErrInvalidAudience = errors.New("invalid audience")
)

// setupJWKS initializes the JWKS for JWT verification
func setupJWKS(betterAuthBaseURL string) error {
	jwksURL := fmt.Sprintf("%s/api/auth/jwks", betterAuthBaseURL)
	log.Debug().Msgf("[JWT DEBUG] Fetching JWKS from: %s", jwksURL)

	options := keyfunc.Options{
		RefreshInterval: 24 * time.Hour,
		RefreshTimeout:  10 * time.Second,
	}

	var err error
	jwks, err = keyfunc.Get(jwksURL, options)
	if err != nil {
		log.Debug().Err(err).Msg("[JWT DEBUG] Failed to fetch JWKS")
		return fmt.Errorf("failed to get JWKS: %w", err)
	}

	log.Debug().Msg("[JWT DEBUG] Successfully fetched JWKS")
	return nil
}

// initJWKS ensures JWKS is initialized exactly once
func initJWKS(cfg *config.Config) error {
	jwksOnce.Do(func() {
		jwksInitErr = setupJWKS(cfg.FrontendURL)
	})
	return jwksInitErr
}

// verifyBetterAuthJWT verifies a JWT token from better-auth
func verifyBetterAuthJWT(tokenString string, cfg *config.Config) (*jwt.Token, error) {
	if err := initJWKS(cfg); err != nil {
		return nil, err
	}

	token, err := jwt.Parse(tokenString, jwks.Keyfunc)
	if err != nil {
		log.Debug().Err(err).Msg("[JWT DEBUG] Failed to parse token")
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if !token.Valid {
		log.Debug().Msg("[JWT DEBUG] Token is invalid")
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		log.Debug().Msg("[JWT DEBUG] Failed to extract claims")
		return nil, errors.New("invalid token claims")
	}

	if iss, ok := claims["iss"].(string); !ok || iss != cfg.FrontendURL {
		log.Debug().Msgf("[JWT DEBUG] Issuer mismatch: got '%s', expected '%s'", iss, cfg.FrontendURL)
		return nil, ErrInvalidIssuer
	}

	if aud, ok := claims["aud"].(string); !ok || aud != cfg.FrontendURL {
		log.Debug().Msgf("[JWT DEBUG] Audience mismatch: got '%s', expected '%s'", aud, cfg.FrontendURL)
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

		token, err := verifyBetterAuthJWT(tokenString, cfg)
		if err != nil {
			http.SendUnauthorized(c, err, http.WithMessage("Token validation failed"))
			c.Abort()
			return
		}

		claims := token.Claims.(jwt.MapClaims)

		userID, ok := claims["id"].(string)
		if !ok {
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
