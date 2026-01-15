package hodlmm

import (
	"backend/api/http"
	"fmt"

	_ "backend/internal/db/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetHodlmmAlerts godoc
//
// @Summary      Retrieve all HODLMM alerts for the authenticated user
// @Description  Fetch all position alerts belonging to the currently authenticated user
// @Tags         HodlmmAlerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Success      200  {object}  http.Response{data=[]repository.HodlmmAlert}  "User alerts retrieved successfully"
// @Failure      500  {object}  http.InternalServerErrorResponse        "Internal server error"
// @Router       /hodlmm/alerts [get]
func (h *HodlmmHandler) GetHodlmmAlerts(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	alerts, err := h.hodlmmService.GetHodlmmAlerts(ctx, userID)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, alerts, http.WithMessage("User alerts retrieved successfully"))
}

// GetHodlmmAlertByID godoc
//
// @Summary      Retrieve a specific HODLMM alert by ID
// @Description  Fetch a single position alert by its UUID
// @Tags         HodlmmAlerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Alert ID (UUID)"
// @Success      200  {object}  http.Response{data=repository.HodlmmAlert}  "Alert retrieved successfully"
// @Failure      400  {object}  map[string]string                     "Invalid UUID format"
// @Failure      404  {object}  map[string]string                     "Alert not found"
// @Failure      500  {object}  http.InternalServerErrorResponse      "Internal server error"
// @Router       /hodlmm/alerts/{id} [get]
func (h *HodlmmHandler) GetHodlmmAlertByID(c *gin.Context, userID string) {
	ctx := c.Request.Context()
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid UUID format"), http.WithMessage("Invalid UUID format"))
		return
	}

	alert, err := h.hodlmmService.GetHodlmmAlertByID(ctx, id, userID)
	if err != nil {
		http.SendInternalServerError(c, err) // Service should handle 404 translation ideally, or we check error
		return
	}

	http.SendSuccess(c, alert, http.WithMessage("Alert retrieved successfully"))
}
