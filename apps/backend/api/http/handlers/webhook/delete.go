package webhook

import (
	"backend/api/http"
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

// DeleteWebhookConfig godoc
//
// @Summary        Delete webhook configuration
// @Description    Delete the webhook configuration for the authenticated user
// @Tags           Webhooks
// @Security       ApiKeyAuth
// @Produce        json
// @Success        200             {object}    http.Response    "Webhook configuration deleted successfully"
// @Failure        404             {object}    map[string]string                        "Webhook configuration not found"
// @Failure        500             {object}    http.InternalServerErrorResponse        "Internal server error"
// @Router         /webhooks [delete]
func (h *WebhookHandler) DeleteWebhookConfig(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	err := h.webhookService.DeleteWebhookConfig(ctx, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) || err.Error() == "webhook config not found" {
			http.SendNotFound(c, err, http.WithMessage("Webhook configuration not found"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	h.deleteCachedWebhookConfig(ctx, userID)

	http.SendSuccess(c, nil, http.WithMessage("Webhook config deleted successfully"))
}
