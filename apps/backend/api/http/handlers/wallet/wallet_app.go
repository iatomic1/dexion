package wallet

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"backend/internal/domain"
	"context"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/golodash/galidator/v2"
	"github.com/jackc/pgx/v5/pgconn"
)

type NewWalletHandler struct {
	srv *http.Server
}

func NewAppWalletHandler(srv *http.Server) *NewWalletHandler {
	return &NewWalletHandler{srv: srv}
}

// TrackWallet godoc
//
// @Summary        Track a new wallet
// @Description    Add a wallet to user's tracking list
// @Tags           Wallets
// @Security       ApiKeyAuth
// @Accept         json
// @Produce        json
// @Param          WalletRequest    body        repository.UpsertUserWalletParams    true    "Wallet tracking data"
// @Success        201              {object}    http.Response{data=repository.UserWallet}    "Wallet tracked successfully"
// @Failure        400              {object}    map[string]string                             "Invalid request data"
// @Failure        409              {object}    map[string]string                             "Wallet already tracked"
// @Failure        500              {object}    http.InternalServerErrorResponse             "Internal server error"
// @Router         /wallets [post]
func (h *NewWalletHandler) TrackWallet(c *gin.Context) {
	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
	})
	customizer := g.Validator(repository.UpsertUserWalletParams{})

	var req repository.UpsertUserWalletParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	userID, err := domain.GetUserIDFromContext(c)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("error getting userID"))
		return
	}
	ctx := context.Background()

	// First check if user is already tracking this wallet
	repo := repository.New(h.srv.DB)
	isTracking, err := repo.IsTrackingWallet(ctx, repository.IsTrackingWalletParams{
		UserID:        userID,
		WalletAddress: req.WalletAddress,
	})
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	if isTracking {
		http.SendConflict(c, fmt.Errorf("wallet already tracked"), http.WithMessage(domain.ErrWalletAlreadyTracked))
		return
	}

	tx, err := h.srv.DB.Begin(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer tx.Rollback(ctx)

	txRepo := repository.New(tx)

	// Create wallet if not exists
	_, err = txRepo.CreateWallet(ctx, req.WalletAddress)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	userWallet, err := txRepo.UpsertUserWallet(ctx, repository.UpsertUserWalletParams{
		UserID:        userID,
		WalletAddress: req.WalletAddress,
		Nickname:      req.Nickname,
		Emoji:         req.Emoji,
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == domain.UniqueViolation {
			http.SendConflict(c, err, http.WithMessage(domain.ErrWalletAlreadyTracked))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	if err := tx.Commit(ctx); err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendCreated(c, userWallet, http.WithMessage(domain.WalletTrackedSuccess))
}

// GetTrackedWallets godoc
//
// @Summary        Get tracked wallets
// @Description    Retrieve all wallets tracked by the user
// @Tags           Wallets
// @Security       ApiKeyAuth
// @Produce        json
// @Success        200    {object}    http.Response{data=[]repository.GetUserTrackedWalletsRow}    "Wallets retrieved"
// @Failure        500    {object}    http.InternalServerErrorResponse                            "Internal server error"
// @Router         /wallets [get]
func (h *NewWalletHandler) GetTrackedWallets(c *gin.Context) {
	userID, err := domain.GetUserIDFromContext(c)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("error getting userID"))
		return
	}
	ctx := context.Background()

	repo := repository.New(h.srv.DB)
	wallets, err := repo.GetUserTrackedWallets(ctx, userID)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, wallets, http.WithMessage(domain.WalletsRetrieved))
}

// GetAllWallets godoc
//
// @Summary        Get all wallets
// @Description    Retrieve all wallets in the system
// @Tags           Wallets
// @Produce        json
// @Success        200    {object}    http.Response{data=[]repository.Wallet}    "All wallets retrieved"
// @Failure        500    {object}    http.InternalServerErrorResponse           "Internal server error"
// @Router         /wallets/all [get]
func (h *NewWalletHandler) GetAllWallets(c *gin.Context) {
	ctx := context.Background()
	repo := repository.New(h.srv.DB)
	wallets, err := repo.GetAllWallets(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, wallets, http.WithMessage(domain.WalletsRetrieved))
}

// UpdateWalletPreferences godoc
//
// @Summary        Update wallet preferences
// @Description    Update nickname or emoji for a tracked wallet
// @Tags           Wallets
// @Security       ApiKeyAuth
// @Accept         json
// @Produce        json
// @Param          address         path        string                                        true    "Wallet address"
// @Param          preferences     body        repository.UpdateWalletPreferencesParams      true    "Update data"
// @Success        200             {object}    http.Response{data=repository.UserWallet}     "Preferences updated"
// @Failure        400             {object}    map[string]string                             "Invalid request data"
// @Failure        404             {object}    map[string]string                             "Wallet not found"
// @Failure        500             {object}    http.InternalServerErrorResponse              "Internal server error"
// @Router         /wallets/{address} [patch]
func (h *NewWalletHandler) UpdateWalletPreferences(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		http.SendBadRequest(c, fmt.Errorf("address is required"), http.WithMessage("Wallet address is required"))
		return
	}

	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
	})
	customizer := g.Validator(repository.UpdateWalletPreferencesParams{})

	var req struct {
		Nickname string  `binding:"required" json:"nickname"`
		Emoji    *string `json:"emoji"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	userID, err := domain.GetUserIDFromContext(c)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("error getting userID"))
		return
	}

	ctx := context.Background()
	repo := repository.New(h.srv.DB)

	// First check if wallet is being tracked by the user
	isTracking, err := repo.IsTrackingWallet(ctx, repository.IsTrackingWalletParams{
		UserID:        userID,
		WalletAddress: address,
	})
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	if !isTracking {
		http.SendNotFound(c, fmt.Errorf("wallet not tracked"), http.WithMessage("You are not tracking this wallet"))
		return
	}

	// Update wallet preferences
	updatedWallet, err := repo.UpdateWalletPreferences(ctx, repository.UpdateWalletPreferencesParams{
		UserID:        userID,
		WalletAddress: address,
		Nickname:      req.Nickname,
		Emoji:         req.Emoji,
	})
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, updatedWallet, http.WithMessage("Wallet preferences updated successfully"))
}

// UntrackWallet godoc
//
// @Summary        Untrack wallet
// @Description    Remove a wallet from user's tracking list
// @Tags           Wallets
// @Security       ApiKeyAuth
// @Param          address    path    string    true    "Wallet address"
// @Success        204        "Wallet untracked"
// @Failure        404        {object}    map[string]string                             "Wallet not found"
// @Failure        500        {object}    http.InternalServerErrorResponse             "Internal server error"
// @Router         /wallets/{address} [delete]
func (h *NewWalletHandler) UntrackWallet(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		http.SendBadRequest(c, fmt.Errorf("address is required"), http.WithMessage("Wallet address is required"))
		return
	}

	userID, err := domain.GetUserIDFromContext(c)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("error getting userID"))
		return
	}

	ctx := context.Background()
	tx, err := h.srv.DB.Begin(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer tx.Rollback(ctx)

	repo := repository.New(tx)

	// First check if wallet is being tracked by the user
	isTracking, err := repo.IsTrackingWallet(ctx, repository.IsTrackingWalletParams{
		UserID:        userID,
		WalletAddress: address,
	})
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	if !isTracking {
		http.SendNotFound(c, fmt.Errorf("wallet not tracked"), http.WithMessage("You are not tracking this wallet"))
		return
	}

	// Untrack wallet
	err = repo.UntrackWallet(ctx, repository.UntrackWalletParams{
		UserID:        userID,
		WalletAddress: address,
	})
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	// Clean up orphaned wallet if no one else is tracking it
	err = repo.CleanupOrphanedWallet(ctx, address)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	if err = tx.Commit(ctx); err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendNoContent(c)
}
