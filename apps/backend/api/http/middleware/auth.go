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

// betterAuthValidMethods are the JWS algorithms better-auth's JWT plugin is
// allowed to sign with. This must match `jwks.keyPairConfig.alg` on the
// better-auth side ("EdDSA" is better-auth's default) - pinning it here
// stops the parser from accepting a token signed with an algorithm the
// server never asked for.
var betterAuthValidMethods = []string{"EdDSA"}

// jwksRetryBackoff bounds how often a failed JWKS fetch is retried on the
// request path, so a burst of requests during an outage doesn't turn into a
// burst of outbound fetches.
const jwksRetryBackoff = 30 * time.Second

// jwksVerifier owns the JWKS used to verify better-auth JWTs. Unlike a plain
// sync.Once, a failed fetch is retried (with backoff) instead of being
// cached as a permanent failure for the life of the process.
type jwksVerifier struct {
	cfg *config.Config

	mu          sync.Mutex
	jwks        *keyfunc.JWKS
	lastErr     error
	lastAttempt time.Time
}

func newJWKSVerifier(cfg *config.Config) *jwksVerifier {
	return &jwksVerifier{cfg: cfg}
}

// warmUp performs an initial JWKS fetch eagerly (called at router setup /
// process startup) so a misconfigured or unreachable better-auth instance
// is surfaced in the logs immediately rather than on some user's first
// request. Failure here is non-fatal: get() will retry lazily.
func (v *jwksVerifier) warmUp() {
	if _, err := v.get(); err != nil {
		log.Warn().Err(err).Msg("initial JWKS fetch failed; will retry on incoming requests")
	}
}

func (v *jwksVerifier) get() (*keyfunc.JWKS, error) {
	v.mu.Lock()
	defer v.mu.Unlock()

	if v.jwks != nil {
		return v.jwks, nil
	}
	if v.lastErr != nil && time.Since(v.lastAttempt) < jwksRetryBackoff {
		return nil, v.lastErr
	}

	jwksURL := fmt.Sprintf("%s/api/auth/jwks", v.cfg.FrontendURL)
	log.Debug().Str("url", jwksURL).Msg("fetching JWKS")

	fetched, err := keyfunc.Get(jwksURL, keyfunc.Options{
		RefreshInterval: 24 * time.Hour,
		RefreshTimeout:  10 * time.Second,
	})
	v.lastAttempt = time.Now()
	if err != nil {
		v.lastErr = fmt.Errorf("failed to fetch JWKS: %w", err)
		return nil, v.lastErr
	}

	v.jwks = fetched
	v.lastErr = nil
	return fetched, nil
}

// verify parses and validates a better-auth JWT: signature (against the
// JWKS, restricted to betterAuthValidMethods), issuer, audience, and
// expiry/not-before with a small clock-skew allowance.
func (v *jwksVerifier) verify(tokenString string) (jwt.MapClaims, error) {
	jwks, err := v.get()
	if err != nil {
		return nil, err
	}

	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(
		tokenString,
		claims,
		jwks.Keyfunc,
		jwt.WithValidMethods(betterAuthValidMethods),
		jwt.WithIssuer(v.cfg.FrontendURL),
		jwt.WithAudience(v.cfg.FrontendURL),
		jwt.WithLeeway(30*time.Second),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}
	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

var (
	sharedJWKSVerifier     *jwksVerifier
	sharedJWKSVerifierOnce sync.Once
)

// getSharedJWKSVerifier returns the process-wide verifier, constructing (and
// warming up) it on first use. All routers share one verifier/JWKS so
// mounting auth on multiple route groups doesn't fetch the JWKS repeatedly.
func getSharedJWKSVerifier(cfg *config.Config) *jwksVerifier {
	sharedJWKSVerifierOnce.Do(func() {
		sharedJWKSVerifier = newJWKSVerifier(cfg)
		sharedJWKSVerifier.warmUp()
	})
	return sharedJWKSVerifier
}

// AccessTokenMiddleware validates better-auth-issued access tokens (JWTs)
// passed as `Authorization: Bearer <token>` and populates the gin context
// with the authenticated user's id/name/email/etc.
func AccessTokenMiddleware(cfg *config.Config) gin.HandlerFunc {
	verifier := getSharedJWKSVerifier(cfg)

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

		claims, err := verifier.verify(tokenParts[1])
		if err != nil {
			log.Debug().Err(err).Msg("JWT validation failed")
			http.SendUnauthorized(c, err, http.WithMessage("Token validation failed"))
			c.Abort()
			return
		}

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

		if image, ok := claims["image"].(string); ok {
			c.Set("userImage", image)
		}

		c.Next()
	}
}
