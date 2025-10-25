package watchlist

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"backend/internal/domain"
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/golodash/galidator/v2"
	"github.com/jackc/pgx/v5/pgconn"
	_ "backend/internal/db/repository"
)

// CreateWatchlist godoc
//
// @Summary        Create a new watchlist entry
// @Description    Add a contract address to user's watchlist
// @Tags           Watchlist
// @Security       ApiKeyAuth
// @Accept         json
// @Produce        json
// @Param          WatchlistRequest    body        repository.CreateWatchlistParams    true    "Watchlist data"
// @Success        201                 {object}    http.Response{data=repository.Watchlist}    "Watchlist created successfully"
// @Failure        400                 {object}    map[string]string                            "Invalid request data"
// @Failure        409                 {object}    map[string]string                            "Contract already in watchlist"
// @Failure        500                 {object}    http.InternalServerErrorResponse            "Internal server error"
// @Router         /watchlist [post]
func (h *WatchlistHandler) CreateWatchlist(c *gin.Context, userID string) {
	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
	})
	customizer := g.Validator(repository.CreateWatchlistParams{})

	var req repository.CreateWatchlistParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	req.UserID = &userID
	ctx := c.Request.Context()

	watchlist, err := h.watchlistService.CreateWatchlist(ctx, req)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == domain.UniqueViolation {
			http.SendConflict(c, err, http.WithMessage("Contract already in watchlist"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	http.SendCreated(c, watchlist, http.WithMessage("Contract added to watchlist successfully"))
}
