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

// NewTelegramWalletHandler creates a new handler for telegram wallet operations
func NewTelegramWalletHandler(srv *http.Server) *NewWalletHandler {
	return &NewWalletHandler{srv: srv}
}

// CreateTelegramUser godoc
// @Summary Create or update a telegram user
// @Description Creates a new telegram user or updates an existing one's information
// @Tags WalletsTelegram
// @Accept json
// @Produce json
// @Param UserRequest body repository.CreateTelegramUserParams true "User creation/update data"
// @Success 201 {object} http.Response{data=repository.TelegramUser} "User created or updated successfully"
// @Failure 400 {object} map[string]string "Invalid request data"
// @Failure 500 {object} http.InternalServerErrorResponse "Internal server error"
// @Router /wallets/telegram/users [post]
func (h *NewWalletHandler) CreateTelegramUser(c *gin.Context) {

	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
	})
	customizer := g.Validator(repository.CreateTelegramUserParams{})

	var req repository.CreateTelegramUserParams
	fmt.Println(req)

	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	ctx := context.Background()
	repo := repository.New(h.srv.DB)

	user, err := repo.CreateTelegramUser(ctx, req)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendCreated(c, user, http.WithMessage("User created or updated successfully"))
}

// TrackWalletTelegram godoc
// @Summary Track a new wallet for a telegram user
// @Description Add a wallet to a telegram user's tracking list
// @Tags WalletsTelegram
// @Accept json
// @Produce json
// @Param WalletRequest body repository.UpsertTelegramUserWalletParams true "Wallet tracking data"
// @Success 201 {object} http.Response{data=repository.TelegramUserWallet} "Wallet tracked successfully"
// @Failure 400 {object} map[string]string "Invalid request data"
// @Failure 409 {object} map[string]string "Wallet already tracked"
// @Failure 500 {object} http.InternalServerErrorResponse "Internal server error"
// @Router /wallets/telegram [post]
func (h *NewWalletHandler) TrackWalletTelegram(c *gin.Context) {
	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
	})
	customizer := g.Validator(repository.UpsertTelegramUserWalletParams{})

	var req repository.UpsertTelegramUserWalletParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	ctx := context.Background()

	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer cleanup()

	txRepo := repository.New(tx)

	userWallet, err := txRepo.UpsertTelegramUserWallet(ctx, req)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == domain.UniqueViolation {
			http.SendConflict(c, err, http.WithMessage(domain.ErrWalletAlreadyTracked))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

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

// GetTrackedWalletsTelegram godoc
//
// @Summary        Get tracked wallets for a telegram user
// @Description    Retrieve all wallets tracked by a telegram user
// @Tags           WalletsTelegram
// @Produce        json
// @Param          chat_id    path        string    true    "Telegram Chat ID"
// @Success        200        {object}    http.Response{data=[]repository.GetTrackedWalletsTelegramRow}    "Wallets retrieved"
// @Failure        400        {object}    map[string]string "Invalid chat ID"
// @Failure        500        {object}    http.InternalServerErrorResponse "Internal server error"
// @Router         /wallets/telegram/{chat_id} [get]
func (h *NewWalletHandler) GetTrackedWalletsTelegram(c *gin.Context) {
	chatID := c.Param("chat_id")

	ctx := context.Background()

	repo := repository.New(h.srv.DB)
	wallets, err := repo.GetTrackedWalletsTelegram(ctx, chatID)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, wallets, http.WithMessage(domain.WalletsRetrieved))
}

// UntrackWalletTelegram godoc
//
// @Summary        Untrack wallet for a telegram user
// @Description    Remove a wallet from a telegram user's tracking list
// @Tags           WalletsTelegram
// @Produce        json
// @Param          chat_id    path        string    true    "Telegram Chat ID"
// @Param          address    path        string true    "Wallet Address"
// @Success        204        "Wallet untracked"
// @Failure        400        {object}    map[string]string "Invalid chat ID or address"
// @Failure        404        {object}    map[string]string "Wallet not found"
// @Failure        500        {object}    http.InternalServerErrorResponse "Internal server error"
// @Router         /wallets/telegram/{chat_id}/{address} [delete]
func (h *NewWalletHandler) UntrackWalletTelegram(c *gin.Context) {
	chatID := c.Param("chat_id")

	address := c.Param("address")
	if address == "" {
		http.SendBadRequest(c, fmt.Errorf("address is required"), http.WithMessage("Wallet address is required"))
		return
	}

	ctx := context.Background()

	// Use a transaction for this operation
	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer cleanup()

	repo := repository.New(tx)

	// First, check if the user is actually tracking this wallet
	isTracking, err := repo.IsTrackingWalletTelegram(ctx, repository.IsTrackingWalletTelegramParams{
		ChatID:        chatID,
		WalletAddress: address,
	})
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	if !isTracking {
		http.SendNotFound(c, fmt.Errorf("wallet not tracked by this user"), http.WithMessage("You are not tracking this wallet"))
		return
	}

	// Untrack the wallet
	err = repo.UntrackWalletTelegram(ctx, repository.UntrackWalletTelegramParams{
		ChatID:        chatID,
		WalletAddress: address,
	})
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	// Attempt to clean up the wallet if it's no longer tracked by anyone
	err = repo.CleanupOrphanedWallet(ctx, address)
	if err != nil {
		// Log this error but don't fail the request, as the primary operation (untracking) was successful
		fmt.Printf("Failed to cleanup orphaned wallet %s: %v\n", address, err)
	}

	// Commit the transaction
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
