package alerts

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/rs/zerolog/log"
)

// GetUserAlerts godoc
//
// @Summary      Retrieve all alerts for the authenticated user
// @Description  Fetch all alerts belonging to the currently authenticated user
// @Tags         Alerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Success      200  {object}  http.Response{data=[]repository.Alert}  "User alerts retrieved successfully"
// @Failure      500  {object}  http.InternalServerErrorResponse        "Internal server error"
// @Router       /alerts [get]
func (h *AlertHandler) GetUserAlerts(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	alerts, err := h.alertService.GetUserAlerts(ctx, userID)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, alerts, http.WithMessage("User alerts retrieved successfully"))
}

// GetAllChannels godoc
//
// @Summary      Retrieve all channels
// @Description  Fetch all available channels in the system
// @Tags         Alerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Success      200  {object}  http.Response{data=[]repository.Channel}  "Channels retrieved successfully"
// @Failure      500  {object}  http.InternalServerErrorResponse          "Internal server error"
// @Router       /alerts/channels/all [get]
func (h *AlertHandler) GetAllChannels(c *gin.Context) {
	ctx := c.Request.Context()

	repo := repository.New(h.srv.DB)
	channels, err := repo.GetAllChannels(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	log.Info().Interface("channels", channels).Msg("channels retrieved")

	http.SendSuccess(c, channels, http.WithMessage("Channels retrieved successfully"))
}

// GetAlertByID godoc
//
// @Summary      Retrieve a specific alert by ID
// @Description  Fetch a single alert by its UUID for the authenticated user
// @Tags         Alerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Alert ID (UUID)"
// @Success      200  {object}  http.Response{data=repository.Alert}  "Alert retrieved successfully"
// @Failure      400  {object}  map[string]string                     "Invalid UUID format"
// @Failure      404  {object}  map[string]string                     "Alert not found"
// @Failure      500  {object}  http.InternalServerErrorResponse      "Internal server error"
// @Router       /alerts/{id} [get]
func (h *AlertHandler) GetAlertByID(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid UUID format"), http.WithMessage("Invalid UUID format"))
		return
	}

	alert, err := h.alertService.GetAlertByID(ctx, id, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.SendNotFound(c, err, http.WithMessage("Alert not found"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, alert, http.WithMessage("Alert retrieved successfully"))
}

// rawWebhookChannel is a temporary struct for unmarshalling webhook data from Redis
type rawWebhookChannel struct {
	ID          string `json:"id"`
	WebhookURL  string `json:"webhookUrl"`
	BearerToken string `json:"bearerToken"`
	Enabled     bool   `json:"enabled"` // "true" or "false"
	Status      string `json:"status"`
}

// GetUserChannels godoc
//
// @Summary      Retrieve notification channels for a user
// @Description  Fetch all notification channels for a given user ID
// @Tags         Alerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        userId   path      string  true  "User ID"
// @Success      200  {object}  http.Response{data=UserChannelsResponse}  "User channels retrieved successfully"
// @Failure      403  {object}  map[string]string                     "Forbidden"
// @Failure      500  {object}  http.InternalServerErrorResponse      "Internal server error"
// @Router       /alerts/channels [get]
func (h *AlertHandler) GetUserChannels(c *gin.Context, userId string) {
	ctx := c.Request.Context()

	data, err := h.getUserChannels(ctx, userId)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("failed to get user channels"))
		return
	}
	response := &UserChannelsResponse{}

	if email, ok := data["email"]; ok {
		response.Email = &email
	}
	if telegramID, ok := data["telegram_id"]; ok {
		response.Telegram = &telegramID
	}
	if webhookJSON, ok := data["webhook"]; ok {
		var rawWebhook rawWebhookChannel
		if err := json.Unmarshal([]byte(webhookJSON), &rawWebhook); err == nil {
			webhoolUUID, err := uuid.Parse(rawWebhook.ID)
			if err != nil {
				h.logger.Error().
					Err(err).
					Str("userID", userId).
					Str("rawWebhookID", rawWebhook.ID).
					Msg("cached webhook ID is invalid (data corruption or legacy format)")

				http.SendInternalServerError(c, err, http.WithMessage("failed to parse webhook ID"))
			}

			response.Webhook = &repository.WebhookConfig{
				ID:          webhoolUUID,
				WebhookUrl:  rawWebhook.WebhookURL,
				BearerToken: rawWebhook.BearerToken,
				Enabled:     &rawWebhook.Enabled,
				Status:      rawWebhook.Status,
			}
		} else {
			h.logger.Error().Err(err).Str("userID", userId).Msg("failed to unmarshal webhook channel info")
		}
	}

	http.SendSuccess(c, response, http.WithMessage("User channels retrieved successfully"))
}
