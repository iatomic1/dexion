package alerts

import (
	"backend/api/http"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// DeleteAlert godoc
//
// @Summary      Delete an existing alert
// @Description  Remove an alert belonging to the authenticated user
// @Tags         Alerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        id     path      string  true  "Alert ID (UUID)"
// @Success      200    {object}  http.Response{data=interface{}}  "Alert deleted successfully"
// @Failure      400    {object}  map[string]string               "Invalid UUID format"
// @Failure      404    {object}  map[string]string               "Alert not found"
// @Failure      500    {object}  http.InternalServerErrorResponse  "Internal server error"
// @Router       /alerts/{id} [delete]
func (h *AlertHandler) DeleteAlert(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid UUID format"), http.WithMessage("Invalid UUID format"))
		return
	}

	alert, err := h.alertService.DeleteAlert(ctx, id, userID)
	if err != nil {
		if err.Error() == "alert not found" {
			http.SendNotFound(c, err, http.WithMessage("Alert not found"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	h.deleteCachedAlert(ctx, id, alert.Ca)

	http.SendSuccess(c, nil, http.WithMessage("Alert deleted successfully"))
}

type DeleteAlertsRequest struct {
	Ids []uuid.UUID `json:"ids"`
}

// DeleteAlerts godoc
//
// @Summary      Delete multiple alerts
// @Description  Remove multiple alerts belonging to the authenticated user
// @Tags         Alerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        ids     body      DeleteAlertsRequest  true  "Alert IDs (UUIDs)"
// @Success      200    {object}  http.Response{data=interface{}}  "Alerts deleted successfully"
// @Failure      400    {object}  map[string]string               "Invalid UUID format"
// @Failure      500    {object}  http.InternalServerErrorResponse  "Internal server error"
// @Router       /alerts/delete [post]
func (h *AlertHandler) DeleteAlerts(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	var req DeleteAlertsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid request body"), http.WithMessage("Invalid request body"))
		return
	}

	if len(req.Ids) == 0 {
		http.SendBadRequest(c, fmt.Errorf("no alert IDs provided"), http.WithMessage("No alert IDs provided"))
		return
	}
	alerts, err := h.alertService.DeleteAlerts(ctx, req.Ids, userID)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	for _, alert := range alerts {
		h.deleteCachedAlert(ctx, alert.ID, alert.Ca)
	}

	http.SendSuccess(c, DeleteAlertsResponse{
		deleted: len(alerts),
	}, http.WithMessage("Alerts deleted successfully"))
}
