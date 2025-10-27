package webhook

import (
	"backend/api/http"
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

// GetWebhookConfig godoc
//
// @Summary        Get webhook configuration
// @Description    Get the webhook configuration for the authenticated user
// @Tags           Webhooks
// @Security       ApiKeyAuth
// @Produce        json
// @Success        200             {object}    http.Response{data=repository.WebhookConfig}    "Webhook configuration retrieved successfully"
// @Failure        404             {object}    map[string]string                        "Webhook configuration not found"
// @Failure        500             {object}    http.InternalServerErrorResponse        "Internal server error"
// @Router         /webhooks [get]
func (h *WebhookHandler) GetWebhookConfig(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	cachedConfig, err := h.getCachedWebhookConfig(ctx, userID)
	if err == nil && cachedConfig != nil {
		http.SendSuccess(c, cachedConfig, http.WithMessage("Webhook config retrieved successfully from cache"))
		return
	}

	webhookConfig, err := h.webhookService.GetWebhookConfig(ctx, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.SendNotFound(c, err, http.WithMessage("Webhook configuration not found"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	h.cacheWebhookConfig(ctx, webhookConfig)

	http.SendSuccess(c, webhookConfig, http.WithMessage("Webhook config retrieved successfully"))
}
