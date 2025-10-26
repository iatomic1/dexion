package webhook

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

// UpdateWebhookConfig godoc
//
// @Summary        Update webhook configuration
// @Description    Update the webhook configuration for the authenticated user
// @Tags           Webhooks
// @Security       ApiKeyAuth
// @Accept         json
// @Produce        json
// @Param          WebhookRequest    body        repository.UpdateWebhookConfigParams    true    "Webhook configuration data"
// @Success        200             {object}    http.Response{data=repository.WebhookConfig}    "Webhook configuration updated successfully"
// @Failure        400             {object}    map[string]string                        "Invalid request data"
// @Failure        404             {object}    map[string]string                        "Webhook configuration not found"
// @Failure        500             {object}    http.InternalServerErrorResponse        "Internal server error"
// @Router         /webhooks [put]
func (h *WebhookHandler) UpdateWebhookConfig(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	var req repository.UpdateWebhookConfigParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, err)
		return
	}

	req.UserID = userID

	webhookConfig, err := h.webhookService.UpdateWebhookConfig(ctx, req)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.SendNotFound(c, err, http.WithMessage("Webhook configuration not found"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	h.cacheWebhookConfig(ctx, webhookConfig)

	http.SendSuccess(c, webhookConfig, http.WithMessage("Webhook config updated successfully"))
}
