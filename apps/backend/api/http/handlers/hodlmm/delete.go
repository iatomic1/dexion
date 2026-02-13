package hodlmm

import (
	"backend/api/http"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// DeleteHodlmmAlert godoc
//
// @Summary      Delete an existing HODLMM alert
// @Description  Remove a position alert belonging to the authenticated user
// @Tags         HodlmmAlerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        id     path      string  true  "Alert ID (UUID)"
// @Success      200    {object}  http.Response{data=interface{}}  "Alert deleted successfully"
// @Failure      400    {object}  map[string]string               "Invalid UUID format"
// @Failure      404    {object}  map[string]string               "Alert not found"
// @Failure      500    {object}  http.InternalServerErrorResponse  "Internal server error"
// @Router       /hodlmm/alerts/{id} [delete]
func (h *HodlmmHandler) DeleteHodlmmAlert(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid UUID format"), http.WithMessage("Invalid UUID format"))
		return
	}

	err = h.hodlmmService.DeleteHodlmmAlert(ctx, id, userID)
	if err != nil {
		// Assuming service returns generic error for now, ideally handle 404 specifically
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, nil, http.WithMessage("Alert deleted successfully"))
}
