package alerts

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"backend/internal/services/alert"

	"github.com/google/uuid"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

type AlertHandler struct {
	srv          *http.Server
	logger       zerolog.Logger
	alertService alert.Service
}

type DeleteAlertsResponse struct {
	deleted int
}

type AlertChannel struct {
	ID string `json:"id"`
}

type CreateAlertWithChannelsParams struct {
	repository.CreateAlertParams
	Channels []string `json:"channels"`
}

type UpdateAlertWithChannelsParams struct {
	repository.UpdateAlertParams
	Channels []string `json:"channels"`
}

type AlertWithChannels struct {
	*repository.Alert
	Channels []string
}

type UpdateAlertParams struct {
	ID         uuid.UUID `json:"-"`                // set from path, not JSON
	UserID     string    `json:"-"`                // set from context, not JSON
	Metric     *string   `json:"metric,omitempty"` // nil if not sent
	Operator   *string   `json:"operator,omitempty"`
	Value      *string   `json:"value,omitempty"`
	Ca         *string   `json:"ca,omitempty"`
	Repeatable *bool     `json:"repeatable,omitempty"`
	Status     *string   `json:"status,omitempty"`
}

type UserChannelsResponse struct {
	Email    *string                   `json:"email,omitempty"`
	Telegram *string                   `json:"telegram_id,omitempty"`
	Webhook  *repository.WebhookConfig `json:"webhook,omitempty"`
}

func NewAlertHandler(srv *http.Server) *AlertHandler {
	logger := log.With().Str("service", "alerts").Logger()
	alertService := alert.NewService(srv.DB, srv.RDB, logger)
	return &AlertHandler{
		srv:          srv,
		logger:       logger,
		alertService: alertService,
	}
}
