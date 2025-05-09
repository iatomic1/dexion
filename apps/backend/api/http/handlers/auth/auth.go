package auth

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"backend/internal/domain"
	"backend/pkg/jwt"
	"backend/pkg/password"
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golodash/galidator/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
)

type Handler struct {
	srv *http.Server
}

func NewAuthHandler(srv *http.Server) *Handler {
	return &Handler{srv: srv}
}

// Helper function to acquire a connection from the pool and create a transaction
func (h *Handler) beginTx(ctx context.Context) (repository.DBTX, func(), error) {
	// Get a connection from the pool
	conn, err := h.srv.DB.Acquire(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to acquire connection: %w", err)
	}

	// Create cleanup function that will be called in defer
	cleanup := func() {
		conn.Release()
	}

	// Begin transaction
	tx, err := conn.Begin(ctx)
	if err != nil {
		cleanup()
		return nil, nil, fmt.Errorf("failed to begin transaction: %w", err)
	}

	// Return transaction and cleanup function
	return tx, func() {
		tx.Rollback(ctx)
		cleanup()
	}, nil
}

// Login godoc
//
//	@Summary		Login to your account
//	@Description	Logs a user into his/her account
//	@Tags			Auth
//	@Accept			json
//	@Produce		json
//	@Param			EmailAndPassword	body		repository.RegisterUserParams				true	"Login data"
//	@Success		201					{object}	http.Response{data=domain.AuthResponse}	"Login success"
//	@Failure		400					{object}	map[string]string							"Invalid request data"
//	@Failure		500					{object}	http.InternalServerErrorResponse			"Internal server error"
//	@Router			/auth/login [post]
func (h *Handler) LoginUser(c *gin.Context) {
	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
		"min":      `$field can't be less than {min}`,
	})
	customizer := g.Validator(repository.RegisterUserParams{})

	ctx := context.Background()
	var req repository.RegisterUserParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	// Get connection and transaction
	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer cleanup()

	repo := repository.New(tx)
	user, err := repo.GetUserByEmail(ctx, req.Email)

	if user.Type != "APP" {
		http.SendUnauthorized(c, nil, http.WithMessage(domain.ErrInvalidEmailOrPassword))
		return
	}

	verify := password.VerifyPassword(req.Password, user.Password)

	if err != nil || !verify {
		http.SendUnauthorized(c, nil, http.WithMessage(domain.ErrInvalidEmailOrPassword))
		return
	}

	tokens, err := jwt.GenerateTokenPair(user.ID.String(), h.srv.Config)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	// Store refresh token ID in database
	refreshTokenUUID, err := uuid.Parse(tokens.RefreshTokenID)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to parse refresh token ID"))
		return
	}

	// Extract expiration from the token claims to ensure consistency with JWT
	claims, err := jwt.ValidateRefreshToken(tokens.RefreshToken, h.srv.Config)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to validate refresh token"))
		return
	}

	expiresUnix, ok := claims["expires"].(float64)
	if !ok {
		http.SendInternalServerError(c, errors.New("failed to extract expiration from token"), http.WithMessage("Invalid token expiration"))
		return
	}

	expiresAt := time.Unix(int64(expiresUnix), 0)
	var pgExpiresAt pgtype.Timestamp
	pgExpiresAt.Time = expiresAt
	pgExpiresAt.Valid = true

	var pgUserID pgtype.UUID
	pgUserID.Bytes = user.ID
	pgUserID.Valid = true

	// Add refresh token to database
	_, err = repo.AddRefreshTokenID(ctx, repository.AddRefreshTokenIDParams{
		ID:        refreshTokenUUID,
		UserID:    pgUserID,
		ExpiresAt: pgExpiresAt,
	})
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to store refresh token"))
		return
	}

	// Commit transaction
	if txObj, ok := tx.(interface{ Commit(context.Context) error }); ok {
		if err := txObj.Commit(ctx); err != nil {
			http.SendInternalServerError(c, err, http.WithMessage("Failed to commit transaction"))
			return
		}
	} else {
		http.SendInternalServerError(c, fmt.Errorf("transaction doesn't support commit"))
		return
	}

	response := domain.AuthResponse{
		TokenPair: jwt.TokenPair{
			AccessToken:  tokens.AccessToken,
			RefreshToken: tokens.RefreshToken,
		},
		UserID: user.ID.String(),
	}

	http.SendSuccess(c, response, http.WithMessage(domain.LoginSuccessful))
}

// Signup godoc
//
//	@Summary		Create an account
//	@Description	Create an account on unwind
//	@Tags			Auth
//	@Accept			json
//	@Produce		json
//	@Param			EmailAndPassword	body		domain.RegisterRequest						true	"Signup data"
//	@Success		201					{object}	http.Response{data=domain.AuthResponse}	"User created successfully"
//	@Failure		500					{object}	http.InternalServerErrorResponse			"Internal server error"
//	@Router			/auth/signup [post]
func (h *Handler) RegisterUser(c *gin.Context) {
	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
	})
	ctx := context.Background()
	customizer := g.Validator(domain.RegisterRequest{})

	var req domain.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Println(err)
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	// Get connection and transaction
	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer cleanup()

	hashed_password, err := password.HashPassword(req.Password)
	if err != nil {
		fmt.Println(err)
		http.SendInternalServerError(c, err, http.WithMessage("Failed to hash password"))
		return
	}

	repo := repository.New(tx)
	user, err := repo.RegisterUser(ctx, repository.RegisterUserParams{
		Email:    req.Email,
		Password: hashed_password,
		Type:     req.Type,
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == domain.UniqueViolation {
			http.SendConflict(c, err, http.WithMessage(domain.ErrEmailAlreadyExist))
			return
		}

		http.SendInternalServerError(c, err)
		return
	}

	tokens, err := jwt.GenerateTokenPair(user.ID.String(), h.srv.Config)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to generate tokens"))
		return
	}

	// Store refresh token ID in database
	refreshTokenUUID, err := uuid.Parse(tokens.RefreshTokenID)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to parse refresh token ID"))
		return
	}

	// Extract expiration from the token claims to ensure consistency with JWT
	claims, err := jwt.ValidateRefreshToken(tokens.RefreshToken, h.srv.Config)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to validate refresh token"))
		return
	}

	expiresUnix, ok := claims["expires"].(float64)
	if !ok {
		http.SendInternalServerError(c, errors.New("failed to extract expiration from token"), http.WithMessage("Invalid token expiration"))
		return
	}

	expiresAt := time.Unix(int64(expiresUnix), 0)
	var pgExpiresAt pgtype.Timestamp
	pgExpiresAt.Time = expiresAt
	pgExpiresAt.Valid = true

	var pgUserID pgtype.UUID
	pgUserID.Bytes = user.ID
	pgUserID.Valid = true

	// Add refresh token to database
	_, err = repo.AddRefreshTokenID(ctx, repository.AddRefreshTokenIDParams{
		ID:        refreshTokenUUID,
		UserID:    pgUserID,
		ExpiresAt: pgExpiresAt,
	})
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to store refresh token"))
		return
	}

	// Commit transaction
	if txObj, ok := tx.(interface{ Commit(context.Context) error }); ok {
		if err := txObj.Commit(ctx); err != nil {
			http.SendInternalServerError(c, err, http.WithMessage("Failed to commit transaction"))
			return
		}
	} else {
		http.SendInternalServerError(c, fmt.Errorf("transaction doesn't support commit"))
		return
	}

	response := domain.AuthResponse{
		TokenPair: jwt.TokenPair{
			AccessToken:  tokens.AccessToken,
			RefreshToken: tokens.RefreshToken,
		},
		UserID: user.ID.String(),
	}

	http.SendCreated(c, response, http.WithMessage(domain.UserCreated))
}

type TelegramRegisterRequest struct {
	TelegramChatID string              `json:"telegram_chat_id" binding:"required"`
	Type           repository.UserType `json:"type" binding:"required,eq=TELEGRAM"`
	Password       string
}

// SignupTG godoc
//
//	@Summary		Create an account
//	@Description	Create an account on dexion
//	@Tags			Auth
//	@Accept			json
//	@Produce		json
//	@Param			EmailAndPassword	body		TelegramRegisterRequest						true	"Signup data"
//	@Success		201					{object}	http.Response{data=repository.User}	"User created successfully"
//	@Failure		500					{object}	http.InternalServerErrorResponse			"Internal server error"
//	@Router			/auth/signup/tg [post]
func (h *Handler) RegisterTelegramUser(c *gin.Context) {
	var req TelegramRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validator := galidator.New().Validator(TelegramRegisterRequest{})
		http.SendValidationError(c, validator.DecryptErrors(err))
		return
	}

	ctx := context.Background()

	// Get connection and transaction
	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer cleanup()

	repo := repository.New(tx)

	// Use a random/placeholder password if it's required by DB (can't be null)
	placeholderPassword := uuid.NewString()

	user, err := repo.RegisterTelegramUser(ctx, repository.RegisterTelegramUserParams{
		Type:           req.Type,
		TelegramChatID: &req.TelegramChatID,
		Password:       placeholderPassword,
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == domain.UniqueViolation {
			http.SendConflict(c, err, http.WithMessage("Telegram user already exists"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	// Commit transaction
	if txObj, ok := tx.(interface{ Commit(context.Context) error }); ok {
		if err := txObj.Commit(ctx); err != nil {
			http.SendInternalServerError(c, err, http.WithMessage("Failed to commit transaction"))
			return
		}
	} else {
		http.SendInternalServerError(c, fmt.Errorf("transaction doesn't support commit"))
		return
	}

	http.SendCreated(c, user, http.WithMessage("Telegram user created"))
}

// @Summary		Refresh Token
// @Description	Refreshes token to get new token pair
// @Security		RefreshTokenBearer
// @Tags			Auth
// @Accept			json
// @Produce		json
// @Success		200	{object}	http.SuccessResponse{data=jwt.TokenPair}	"TokenPair"
// @Failure		401	{object}	http.UnauthorizedResponse						"Unauthorized"
// @Failure		404	{object}	http.NotFoundResponse							"Profile not found"
// @Failure		500	{object}	http.InternalServerErrorResponse				"Internal server error"
// @Router			/auth/refresh [get]
func (h *Handler) RefreshToken(c *gin.Context) {
	ctx := context.Background()

	userId, ok := c.Get("userId")
	if !ok {
		http.SendUnauthorized(c, nil, http.WithMessage("UserId not found for some reason"))
		return
	}

	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer cleanup()

	parsedUserId, err := domain.ParseIDs(userId.(string))
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Error parsing uuid"))
		return
	}

	repo := repository.New(tx)
	user, err := repo.GetUserById(ctx, parsedUserId)
	if user.Type != "APP" {
		http.SendUnauthorized(c, nil, http.WithMessage(domain.ErrInvalidEmailOrPassword))
		return
	}

	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	tokens, err := jwt.GenerateTokenPair(user.ID.String(), h.srv.Config)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage(domain.ErrGeneratingTokens))
		return
	}

	// Extract the JTI (JWT ID) from the refresh token for invalidation
	jti, ok := c.Get("refreshTokenId")
	if !ok {
		http.SendUnauthorized(c, nil, http.WithMessage("Refresh token ID not found"))
		return
	}

	// Delete the used refresh token (implementing refresh token rotation for security)
	refreshTokenIdStr, ok := jti.(string)
	if !ok {
		http.SendInternalServerError(c, errors.New("refresh token ID is not a string"), http.WithMessage("Invalid refresh token type"))
		return
	}

	refreshTokenId, err := uuid.Parse(refreshTokenIdStr)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to parse refresh token ID"))
		return
	}

	// Delete the used refresh token
	err = repo.DeleteRefreshToken(ctx, refreshTokenId)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to invalidate old refresh token"))
		return
	}

	// Store new refresh token ID in database
	refreshTokenUUID, err := uuid.Parse(tokens.RefreshTokenID)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to parse refresh token ID"))
		return
	}

	// Extract expiration from the token claims to ensure consistency with JWT
	claims, err := jwt.ValidateRefreshToken(tokens.RefreshToken, h.srv.Config)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to validate refresh token"))
		return
	}

	expiresUnix, ok := claims["expires"].(float64)
	if !ok {
		http.SendInternalServerError(c, errors.New("failed to extract expiration from token"), http.WithMessage("Invalid token expiration"))
		return
	}

	expiresAt := time.Unix(int64(expiresUnix), 0)
	var pgExpiresAt pgtype.Timestamp
	pgExpiresAt.Time = expiresAt
	pgExpiresAt.Valid = true

	var pgUserID pgtype.UUID
	pgUserID.Bytes = user.ID
	pgUserID.Valid = true

	// Add refresh token to database
	_, err = repo.AddRefreshTokenID(ctx, repository.AddRefreshTokenIDParams{
		ID:        refreshTokenUUID,
		UserID:    pgUserID,
		ExpiresAt: pgExpiresAt,
	})
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to store refresh token"))
		return
	}

	if txObj, ok := tx.(interface{ Commit(context.Context) error }); ok {
		if err := txObj.Commit(ctx); err != nil {
			http.SendInternalServerError(c, err, http.WithMessage("Failed to commit transaction"))
			return
		}
	} else {
		http.SendInternalServerError(c, fmt.Errorf("transaction doesn't support commit"))
		return
	}

	response := jwt.TokenPair{
		AccessToken:    tokens.AccessToken,
		RefreshToken:   tokens.RefreshToken,
		RefreshTokenID: refreshTokenIdStr,
	}
	http.SendSuccess(c, response, http.WithMessage(domain.TokensRefreshed))
}
