package watchlist

import (
	"backend/api/http"
	_ "backend/internal/db/repository"
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
)

// GetUserWatchlists godoc
//
// @Summary        Get user's watchlist
// @Description    Retrieve all watchlist entries for the authenticated user
// @Tags           Watchlist
// @Security       ApiKeyAuth
// @Produce        json
// @Success        200    {object}    http.Response{data=[]repository.Watchlist}    "User watchlist retrieved"
// @Failure        500    {object}    http.InternalServerErrorResponse              "Internal server error"
// @Router         /watchlist [get]
func (h *WatchlistHandler) GetUserWatchlists(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	watchlists, err := h.watchlistService.GetUserWatchlists(ctx, userID)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			h.logger.Error().Err(err).Msgf("PostgreSQL Error: %+v", pgErr) // Log PostgreSQL details
		}
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, watchlists, http.WithMessage("User watchlist retrieved successfully"))
}
