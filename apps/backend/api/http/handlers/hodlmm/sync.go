package hodlmm

import (
	"backend/api/http"
	"fmt"

	_ "backend/internal/db/repository"

	"github.com/gin-gonic/gin"
)

// SyncHodlmmAlerts godoc
//
// @Summary      Sync HODLMM alerts
// @Description  Fetch positions from external API and create missing alerts for the authenticated user
// @Tags         HodlmmAlerts
// @Security     ApiKeyAuth
// @Produce      json
// @Success      201  {object}  http.Response{data=[]repository.HodlmmAlert}  "Alerts synced successfully"
// @Failure      400  {object}  map[string]string                             "User not linked or invalid state"
// @Failure      500  {object}  http.InternalServerErrorResponse              "Internal server error"
// @Router       /hodlmm/alerts/sync [post]
func (h *HodlmmHandler) SyncHodlmmAlerts(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	alerts, err := h.hodlmmService.SyncHodlmmAlerts(ctx, userID)
	if err != nil {
		// Differentiate errors if possible (e.g., user not found vs API error)
		if err.Error() == "user does not have a linked Stacks address" {
			http.SendBadRequest(c, err, http.WithMessage("User must have a linked Stacks address"))
			return
		}
		http.SendInternalServerError(c, err, http.WithMessage("Failed to sync alerts"))
		return
	}

	message := "No new alerts created"
	if len(alerts) > 0 {
		message = fmt.Sprintf("Successfully synced %d new alerts", len(alerts))
	}

	http.SendCreated(c, alerts, http.WithMessage(message))
}
