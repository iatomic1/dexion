package hodlmm

import (
	"backend/api/http"
	"backend/internal/services/hodlmm"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

type HodlmmHandler struct {
	srv           *http.Server
	logger        zerolog.Logger
	hodlmmService hodlmm.Service
}

func NewHodlmmHandler(srv *http.Server) *HodlmmHandler {
	logger := log.With().Str("service", "hodlmm_alerts").Logger()
	hodlmmService := hodlmm.NewService(srv.DB, srv.RDB, logger)
	return &HodlmmHandler{
		srv:           srv,
		logger:        logger,
		hodlmmService: hodlmmService,
	}
}
