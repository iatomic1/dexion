package wallet

import (
	"backend/api/http"
	"backend/internal/services/wallet"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

type NewWalletHandler struct {
	srv           *http.Server
	logger        zerolog.Logger
	walletService wallet.Service
}

func NewAppWalletHandler(srv *http.Server) *NewWalletHandler {
	logger := log.With().Str("service", "wallets").Logger()
	walletService := wallet.NewService(srv.DB, logger)
	return &NewWalletHandler{
		srv:           srv,
		logger:        logger,
		walletService: walletService,
	}
}

func NewTelegramWalletHandler(srv *http.Server) *NewWalletHandler {
	logger := log.With().Str("service", "wallets_telegram").Logger()
	walletService := wallet.NewService(srv.DB, logger)
	return &NewWalletHandler{
		srv:           srv,
		logger:        logger,
		walletService: walletService,
	}
}
