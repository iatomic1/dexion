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

// Helper function to acquire a connection from the pool and create a transaction
func (h *NewWalletHandler) beginTx(ctx context.Context) (repository.DBTX, func(), error) {
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
	// We use the main pool for read operations, not a transaction
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

	// For write operations, use our helper to get a transaction
	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer cleanup()

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

	// We need to cast to the underlying transaction type to commit
	if txObj, ok := tx.(interface{ Commit(context.Context) error }); ok {
		if err := txObj.Commit(ctx); err != nil {
			http.SendInternalServerError(c, err)
			return
		}
	} else {
		http.SendInternalServerError(c, fmt.Errorf("transaction doesn't support commit"))
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

	// For read-only operations, we can use the DB pool directly
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

	// For this operation, we'll use a single connection from the pool
	// to ensure consistency across multiple queries
	conn, err := h.srv.DB.Acquire(ctx)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("failed to acquire connection"))
		return
	}
	defer conn.Release()

	repo := repository.New(conn)

	wallets, err := repo.GetAllWallets(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	var combined []map[string]interface{}

	for _, w := range wallets {
		watchers, err := repo.GetWatchersForWallet(ctx, w.Address)
		if err != nil {
			http.SendInternalServerError(c, err)
			return
		}

		var formattedWatchers []map[string]interface{}
		for _, watcher := range watchers {
			formattedWatchers = append(formattedWatchers, map[string]interface{}{
				"userId":        watcher.UserID,
				"nickname":      watcher.Nickname,
				"emoji":         watcher.Emoji,
				"notifications": watcher.Notifications,
			})
		}

		combined = append(combined, map[string]interface{}{
			"wallet_address": w.Address,
			"watchers":       formattedWatchers,
			"created_at":     w.CreatedAt,
		})
	}

	http.SendSuccess(c, combined)
}

// GetWalletWatchers godoc
//
// @Summary        Get all wallets
// @Description    Retrieve all wallets in the system
// @Tags           Wallets
// @Produce        json
// @Success        200    {object}    http.Response{data=[]repository.Wallet}    "All wallets retrieved"
// @Failure        500    {object}    http.InternalServerErrorResponse           "Internal server error"
// @Router         /wallets/{address}/watchers [get]
func (h *NewWalletHandler) GetWalletWatchers(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		http.SendBadRequest(c, fmt.Errorf("address is required"), http.WithMessage("Wallet address is required"))
		return
	}

	ctx := context.Background()
	repo := repository.New(h.srv.DB)
	wallets, err := repo.GetWatchersForWallet(ctx, address)
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
		Nickname      string `json:"nickname"`
		Notifications bool   `json:"notifications"`
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

	// First check using the connection pool
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

	// For the update, acquire a dedicated connection
	conn, err := h.srv.DB.Acquire(ctx)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("failed to acquire connection"))
		return
	}
	defer conn.Release()

	connRepo := repository.New(conn)

	updatedWallet, err := connRepo.UpdateWalletPreferences(ctx, repository.UpdateWalletPreferencesParams{
		ID:            userID,
		WalletAddress: address,
		Nickname:      req.Nickname,
		Notifications: req.Notifications,
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

	// Get transaction using our helper function
	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer cleanup()

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

	// We need to cast to the underlying transaction type to commit
	if txObj, ok := tx.(interface{ Commit(context.Context) error }); ok {
		if err := txObj.Commit(ctx); err != nil {
			http.SendInternalServerError(c, err)
			return
		}
	} else {
		http.SendInternalServerError(c, fmt.Errorf("transaction doesn't support commit"))
		return
	}

	http.SendNoContent(c)
}
