package hodlmm

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UpdateHodlmmAlert godoc
//
// @Summary      Update an existing HODLMM alert
// @Description  Update the details of a position alert belonging to the authenticated user
// @Tags         HodlmmAlerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        id     path      string                          true  "Alert ID (UUID)"
// @Param        Alert  body      repository.UpdateHodlmmAlertParams     true  "Alert update data"
// @Success      200    {object}  http.Response{data=repository.HodlmmAlert}  "Alert updated successfully"
// @Failure      400    {object}  map[string]string                       "Invalid UUID format or request data"
// @Failure      404    {object}  map[string]string                       "Alert not found"
// @Failure      500    {object}  http.InternalServerErrorResponse        "Internal server error"
// @Router       /hodlmm/alerts/{id} [patch]
func (h *HodlmmHandler) UpdateHodlmmAlert(c *gin.Context, userID string) {
	ctx := c.Request.Context()
	idStr := c.Param("id")
	alertID, err := uuid.Parse(idStr)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid UUID format"), http.WithMessage("Invalid UUID format"))
		return
	}

	var req repository.UpdateHodlmmAlertParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, err)
		return
	}

	// Force ID and UserID from context/path
	req.ID = alertID
	req.UserID = userID

	alert, err := h.hodlmmService.UpdateHodlmmAlert(ctx, req)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, alert, http.WithMessage("Alert updated successfully"))
}

// PauseAllHodlmmAlerts godoc
//
// @Summary      Pause all HODLMM alerts
// @Description  Pause all position alerts for the authenticated user
// @Tags         HodlmmAlerts
// @Security     ApiKeyAuth
// @Produce      json
// @Success      200    {object}  http.Response  "Alerts paused successfully"
// @Failure      500    {object}  http.InternalServerErrorResponse  "Internal server error"
// @Router       /hodlmm/alerts/pause [post]
func (h *HodlmmHandler) PauseAllHodlmmAlerts(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	if err := h.hodlmmService.PauseAllHodlmmAlerts(ctx, userID); err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to pause alerts"))
		return
	}

	http.SendSuccess(c, nil, http.WithMessage("All alerts paused successfully"))
}
