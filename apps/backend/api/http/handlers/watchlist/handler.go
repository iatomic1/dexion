// watchlist/watchlist_app.go
package watchlist

import (
	"backend/api/http"
	"backend/internal/services/watchlist"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

type WatchlistHandler struct {
	srv             *http.Server
	logger          zerolog.Logger
	watchlistService watchlist.Service
}

func NewWatchlistHandler(srv *http.Server) *WatchlistHandler {
	logger := log.With().Str("service", "watchlist").Logger()
	watchlistService := watchlist.NewService(srv.DB, logger)
	return &WatchlistHandler{
		srv:             srv,
		logger:          logger,
		watchlistService: watchlistService,
	}
}
