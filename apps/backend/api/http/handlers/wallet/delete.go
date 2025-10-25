package wallet

import (
	"backend/api/http"
	"fmt"

	"github.com/gin-gonic/gin"
)

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
func (h *NewWalletHandler) UntrackWallet(c *gin.Context, userID string) {
	address := c.Param("address")
	if address == "" {
		http.SendBadRequest(c, fmt.Errorf("address is required"), http.WithMessage("Wallet address is required"))
		return
	}

	err := h.walletService.UntrackWallet(c.Request.Context(), userID, address)
	if err != nil {
		if err.Error() == "wallet not tracked" {
			http.SendNotFound(c, err, http.WithMessage("You are not tracking this wallet"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	http.SendNoContent(c)
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

	err := h.walletService.UntrackWalletTelegram(c.Request.Context(), chatID, address)
	if err != nil {
		if err.Error() == "wallet not tracked by this user" {
			http.SendNotFound(c, err, http.WithMessage("You are not tracking this wallet"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	http.SendNoContent(c)
}
