package alerts

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"backend/internal/domain"
	"backend/pkg/cacheutil"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// UpdateAlert godoc
//
// @Summary      Update an existing alert
// @Description  Update the details of an alert belonging to the authenticated user
// @Tags         Alerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        id     path      string                          true  "Alert ID (UUID)"
// @Param        Alert  body      repository.UpdateAlertWithChannelsParams     true  "Alert update data"
// @Success      200    {object}  http.Response{data=repository.UpdateAlertWithChannelsRow}  "Alert updated successfully"
// @Failure      400    {object}  map[string]string                       "Invalid UUID format or request data"
// @Failure      404    {object}  map[string]string                       "Alert not found"
// @Failure      500    {object}  http.InternalServerErrorResponse        "Internal server error"
// @Router       /alerts/{id} [patch]
func (h *AlertHandler) UpdateAlert(c *gin.Context) {
	ctx := c.Request.Context()
	idStr := c.Param("id")
	alertId, err := uuid.Parse(idStr)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid UUID format"), http.WithMessage("Invalid UUID format"))
		return
	}
	userID, err := domain.GetUserIDFromContext(c)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("error getting userID"))
		return
	}
	var req repository.UpdateAlertWithChannelsParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, err)
		return
	}

	// Validate that at least one channel is provided
	if len(req.ChannelIds) == 0 {
		http.SendBadRequest(c, fmt.Errorf("at least one channel required"), http.WithMessage("Alert must have at least one channel"))
		return
	}

	req.AlertID = pgtype.UUID{Bytes: alertId, Valid: true}
	req.UserID = &userID

	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	success := false
	defer cleanup(success)

	txRepo := repository.New(tx)
	alert, err := txRepo.UpdateAlert(ctx, repository.UpdateAlertParams{
		Metric:     *req.Metric,
		Operator:   *req.Operator,
		Value:      *req.Value,
		Repeatable: *req.Repeatable,
		ID:         alertId,
		UserID:     *req.UserID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.SendNotFound(c, err, http.WithMessage("alert not found"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	// Replace alert channels
	err = txRepo.DeleteAlertChannels(ctx, alertId)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("failed to delete alert channels"))
		return
	}
	fmt.Print(req.ChannelIds)

	channels, err := txRepo.InsertAlertChannels(ctx, repository.InsertAlertChannelsParams{
		AlertID: alertId,
		Column2: req.ChannelIds,
	})
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("failed to insert alert channels"))
		return
	}
	fmt.Print(channels)

	success = true
	cleanup(success)

	// Cache the updated alert
	cachedAlert := CachedAlert{
		ID:         alert.ID.String(),
		UserID:     alert.UserID,
		Metric:     alert.Metric,
		Operator:   alert.Operator,
		Value:      alert.Value,
		Ca:         alert.Ca,
		Repeatable: alert.Repeatable,
		Status:     alert.Status,
		UpdatedAt:  alert.UpdatedAt.Format(time.RFC3339),
		CreatedAt:  alert.CreatedAt.Format(time.RFC3339),
	}

	// Convert channels to cache format
	var ids []string
	for _, ch := range channels {
		ids = append(ids, ch.String())
	}
	cachedAlert.Channels = strings.Join(ids, ",")

	if err := cacheutil.CacheStruct(ctx, h.srv.RDB, h.getAlertCacheKey(alert.ID), cachedAlert); err != nil {
		log.Printf("cache update failed for alert %s: %v", alert.ID, err)
	}

	http.SendSuccess(c, alert, http.WithMessage("Alert updated successfully"))
}
