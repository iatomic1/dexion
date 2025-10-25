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
