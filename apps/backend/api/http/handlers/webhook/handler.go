package webhook

import (
	"backend/api/http"
	"backend/internal/services/webhook"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

type WebhookHandler struct {
	srv          *http.Server
	logger       zerolog.Logger
	webhookService webhook.Service
}

func NewWebhookHandler(srv *http.Server) *WebhookHandler {
	logger := log.With().Str("service", "webhook").Logger()
	webhookService := webhook.NewService(srv.DB, logger)
	return &WebhookHandler{
		srv:          srv,
		logger:       logger,
		webhookService: webhookService,
	}
}
