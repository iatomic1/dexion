package watchlist

import (
	"backend/api/http"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// DeleteWatchlist godoc
//
// @Summary        Delete watchlist entry
// @Description    Delete a specific watchlist entry by ID
// @Tags           Watchlist
// @Security       ApiKeyAuth
// @Param          id    path        string    true    "Watchlist ID (UUID)"
// @Success        200   {object}    http.Response    "Watchlist entry deleted successfully"
// @Failure        400   {object}    map[string]string                        "Invalid ID"
// @Failure        404   {object}    map[string]string                        "Watchlist entry not found"
// @Failure        500   {object}    http.InternalServerErrorResponse        "Internal server error"
// @Router         /watchlist/{id} [delete]
func (h *WatchlistHandler) DeleteWatchlist(c *gin.Context, userID string) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid UUID format"), http.WithMessage("Invalid UUID format"))
		return
	}

	h.logger.Info().Str("userID", userID).Str("idStr", idStr).Msg("deleting watchlist")

	ctx := c.Request.Context()

	err = h.watchlistService.DeleteWatchlist(ctx, id, userID)
	if err != nil {
		if err.Error() == "watchlist entry not found" {
			http.SendNotFound(c, err, http.WithMessage("Watchlist entry not found"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, nil, http.WithMessage("Watchlist entry deleted successfully"))
}
