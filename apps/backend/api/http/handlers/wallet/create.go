package wallet

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"backend/internal/domain"
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/golodash/galidator/v2"
	"github.com/jackc/pgx/v5/pgconn"
)

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
func (h *NewWalletHandler) TrackWallet(c *gin.Context, userID string) {
	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
	})
	customizer := g.Validator(repository.UpsertUserWalletParams{})

	var req repository.UpsertUserWalletParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	userWallet, err := h.walletService.TrackWallet(c.Request.Context(), userID, req.WalletAddress, req.Nickname, req.Emoji)
	if err != nil {
		if err.Error() == "wallet already tracked" {
			http.SendConflict(c, err, http.WithMessage(domain.ErrWalletAlreadyTracked))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	http.SendCreated(c, userWallet, http.WithMessage(domain.WalletTrackedSuccess))
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
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	user, err := h.walletService.CreateTelegramUser(c.Request.Context(), req)
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

	userWallet, err := h.walletService.TrackWalletTelegram(c.Request.Context(), req)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == domain.UniqueViolation {
			http.SendConflict(c, err, http.WithMessage(domain.ErrWalletAlreadyTracked))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	http.SendCreated(c, userWallet, http.WithMessage(domain.WalletTrackedSuccess))
}
