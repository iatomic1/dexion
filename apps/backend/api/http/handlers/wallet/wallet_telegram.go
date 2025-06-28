package wallet

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"backend/internal/domain"
	"context"
	"errors"
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/golodash/galidator/v2"
	"github.com/jackc/pgx/v5/pgconn"
)

// NewTelegramWalletHandler creates a new handler for telegram wallet operations
func NewTelegramWalletHandler(srv *http.Server) *NewWalletHandler {
	return &NewWalletHandler{srv: srv}
}

// TrackWalletTelegram godoc
// @Summary Track a new wallet for a telegram user
// @Description Add a wallet to a telegram user's tracking list
// @Tags WalletsTelegram
// @Accept json
// @Produce json
// @Param WalletRequest body repository.TrackWalletTelegramParams true "Wallet tracking data"
// @Success 201 {object} http.Response{data=repository.TelegramUserWallet} "Wallet tracked successfully"
// @Failure 400 {object} map[string]string "Invalid request data"
// @Failure 409 {object} map[string]string "Wallet already tracked"
// @Failure 500 {object} http.InternalServerErrorResponse "Internal server error"
// @Router /wallets/telegram [post]
func (h *NewWalletHandler) TrackWalletTelegram(c *gin.Context) {
	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
	})
	customizer := g.Validator(repository.TrackWalletTelegramParams{})

	var req repository.TrackWalletTelegramParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	ctx := context.Background()

	// First check if user is already tracking this wallet
	repo := repository.New(h.srv.DB)
	isTracking, err := repo.IsTrackingWalletTelegram(ctx, repository.IsTrackingWalletTelegramParams{
		ChatID:        req.ChatID,
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

	userWallet, err := txRepo.TrackWalletTelegram(ctx, req)
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
// @Param          chat_id    path        int    true    "Telegram Chat ID"
// @Success        200        {object}    http.Response{data=[]repository.GetTrackedWalletsTelegramRow}    "Wallets retrieved"
// @Failure        400        {object}    map[string]string "Invalid chat ID"
// @Failure        500        {object}    http.InternalServerErrorResponse "Internal server error"
// @Router         /wallets/telegram/{chat_id} [get]
func (h *NewWalletHandler) GetTrackedWalletsTelegram(c *gin.Context) {
	chatIDStr := c.Param("chat_id")
	chatID, err := strconv.ParseInt(chatIDStr, 10, 64)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid chat ID"), http.WithMessage("Invalid Chat ID format"))
		return
	}

	ctx := context.Background()

	repo := repository.New(h.srv.DB)
	wallets, err := repo.GetTrackedWalletsTelegram(ctx, chatID)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, wallets, http.WithMessage(domain.WalletsRetrieved))
}
