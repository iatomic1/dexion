package wallet

import (
	"backend/api/http"
	"backend/internal/db/repository"

	"github.com/gin-gonic/gin"
)

func (h *NewWalletHandler) UpdateTelegramUserPreference(c *gin.Context) {
	var req repository.UpdateTelegramUserPreferenceParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendBadRequest(c, err)
		return
	}

	repo := repository.New(h.srv.DB)
	user, err := repo.UpdateTelegramUserPreference(c, req)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, user)
}
