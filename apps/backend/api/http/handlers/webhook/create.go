package webhook

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"backend/internal/domain"
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/golodash/galidator/v2"
	"github.com/jackc/pgx/v5/pgconn"
)

// CreateWebhookConfig godoc
//
// @Summary        Create a new webhook configuration
// @Description    Create a new webhook configuration for the authenticated user
// @Tags           Webhooks
// @Security       ApiKeyAuth
// @Accept         json
// @Produce        json
// @Param          WebhookRequest    body        repository.CreateWebhookConfigParams    true    "Webhook configuration data"
// @Success        201             {object}    http.Response{data=repository.WebhookConfig}    "Webhook configuration created successfully"
// @Failure        400             {object}    map[string]string                        "Invalid request data"
// @Failure        409             {object}    map[string]string                        "Webhook configuration already exists"
// @Failure        500             {object}    http.InternalServerErrorResponse        "Internal server error"
// @Router         /webhooks [post]
func (h *WebhookHandler) CreateWebhookConfig(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
	})
	customizer := g.Validator(repository.CreateWebhookConfigParams{})

	var req repository.CreateWebhookConfigParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	req.UserID = userID

	webhookConfig, err := h.webhookService.CreateWebhookConfig(ctx, req)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == domain.UniqueViolation {
			http.SendConflict(c, err, http.WithMessage("Webhook config already exists for this user"))
			return
		}
		http.SendInternalServerError(c, err, http.WithMessage("Failed to create webhook config"))
		return
	}

	h.cacheWebhookConfig(ctx, webhookConfig)

	http.SendCreated(c, webhookConfig, http.WithMessage("Webhook config created successfully"))
}
