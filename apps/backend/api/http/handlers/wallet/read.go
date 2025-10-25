package wallet

import (
	"backend/api/http"
	_ "backend/internal/db/repository"
	"backend/internal/domain"
	"fmt"

	"github.com/gin-gonic/gin"
)

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
func (h *NewWalletHandler) GetTrackedWallets(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	wallets, err := h.walletService.GetTrackedWallets(ctx, userID)
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
	ctx := c.Request.Context()

	wallets, err := h.walletService.GetAllWallets(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	// We need to manually construct the response to get the desired JSON structure
	var responseWallets []gin.H
	for _, w := range wallets {
		responseWallets = append(responseWallets, gin.H{
			"address":    w.Address,
			"created_at": w.CreatedAt,
			"watchers": gin.H{
				"app":      w.AppWatchers,
				"telegram": w.TelegramWatchers,
			},
		})
	}

	http.SendSuccess(c, responseWallets)
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

	ctx := c.Request.Context()
	wallets, err := h.walletService.GetWalletWatchers(ctx, address)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, wallets, http.WithMessage(domain.WalletsRetrieved))
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

	ctx := c.Request.Context()

	wallets, err := h.walletService.GetTrackedWalletsTelegram(ctx, chatID)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, wallets, http.WithMessage(domain.WalletsRetrieved))
}
