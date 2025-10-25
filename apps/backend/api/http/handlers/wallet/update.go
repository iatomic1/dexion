package wallet

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"fmt"

	"github.com/gin-gonic/gin"
)

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
func (h *NewWalletHandler) UpdateWalletPreferences(c *gin.Context, userID string) {
	address := c.Param("address")
	if address == "" {
		http.SendBadRequest(c, fmt.Errorf("address is required"), http.WithMessage("Wallet address is required"))
		return
	}

	var req struct {
		Nickname      string `json:"nickname"`
		Notifications bool   `json:"notifications"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, err)
		return
	}

	updatedWallet, err := h.walletService.UpdateWalletPreferences(c.Request.Context(), userID, address, req.Nickname, req.Notifications)
	if err != nil {
		if err.Error() == "wallet not tracked" {
			http.SendNotFound(c, err, http.WithMessage("You are not tracking this wallet"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, updatedWallet, http.WithMessage("Wallet preferences updated successfully"))
}

func (h *NewWalletHandler) UpdateTelegramUserPreference(c *gin.Context) {
	var req repository.UpdateTelegramUserPreferenceParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendBadRequest(c, err)
		return
	}

	user, err := h.walletService.UpdateTelegramUserPreference(c.Request.Context(), req)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, user)
}
