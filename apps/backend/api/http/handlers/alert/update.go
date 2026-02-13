package alerts

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"database/sql"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
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
func (h *AlertHandler) UpdateAlert(c *gin.Context, userID string) {
	ctx := c.Request.Context()
	idStr := c.Param("id")
	alertId, err := uuid.Parse(idStr)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid UUID format"), http.WithMessage("Invalid UUID format"))
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

	alert, err := h.alertService.UpdateAlert(ctx, repository.UpdateAlertParams{
		Metric:     *req.Metric,
		Operator:   *req.Operator,
		Value:      *req.Value,
		Repeatable: req.Repeatable,
		ID:         alertId,
		UserID:     userID,
	}, req.ChannelIds)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.SendNotFound(c, err, http.WithMessage("alert not found"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, alert, http.WithMessage("Alert updated successfully"))
}

// PauseAlert godoc
//
// @Summary      Pause an existing alert
// @Description  Pause an alert belonging to the authenticated user
// @Tags         Alerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        id     path      string  true  "Alert ID (UUID)"
// @Success      200    {object}  http.Response{data=repository.Alert}  "Alert paused successfully"
// @Failure      400    {object}  map[string]string               "Invalid UUID format"
// @Failure      404    {object}  map[string]string               "Alert not found"
// @Failure      500    {object}  http.InternalServerErrorResponse  "Internal server error"
// @Router       /alerts/{id}/pause [patch]
func (h *AlertHandler) PauseAlert(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid UUID format"), http.WithMessage("Invalid UUID format"))
		return
	}

	alert, err := h.alertService.UpdateAlertStatus(ctx, id, userID, "paused")
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.SendNotFound(c, err, http.WithMessage("Alert not found"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, alert, http.WithMessage("Alert paused successfully"))
}

// UpdateAlertStatus godoc
//
// @Summary      Update an existing alert status
// @Description  Update the status of an alert
// @Tags         Alerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        Alert  body      repository.UpdateAlertStatusParams     true  "Alert update data"
// @Success      200    {object}  http.Response{data=repository.Alert}  "Alert updated successfully"
// @Failure      400    {object}  map[string]string                       "Invalid UUID format or request data"
// @Failure      404    {object}  map[string]string                       "Alert not found"
// @Failure      500    {object}  http.InternalServerErrorResponse        "Internal server error"
// @Router       /alerts/status [patch]
func (h *AlertHandler) UpdateAlertStatus(c *gin.Context) {
	ctx := c.Request.Context()

	var req repository.UpdateAlertStatusParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, err)
		return
	}

	alert, err := h.alertService.UpdateAlertStatus(ctx, req.ID, req.UserID, req.Status)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.SendNotFound(c, err, http.WithMessage("Alert not found"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, alert, http.WithMessage("Alert status updated successfully"))
}
