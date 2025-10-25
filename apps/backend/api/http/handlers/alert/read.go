package alerts

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetUserAlerts godoc
//
// @Summary      Retrieve all alerts for the authenticated user
// @Description  Fetch all alerts belonging to the currently authenticated user
// @Tags         Alerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Success      200  {object}  http.Response{data=[]repository.Alert}  "User alerts retrieved successfully"
// @Failure      500  {object}  http.InternalServerErrorResponse        "Internal server error"
// @Router       /alerts [get]
func (h *AlertHandler) GetUserAlerts(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	alerts, err := h.alertService.GetUserAlerts(ctx, userID)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, alerts, http.WithMessage("User alerts retrieved successfully"))
}

// GetAllChannels godoc
//
// @Summary      Retrieve all channels
// @Description  Fetch all available channels in the system
// @Tags         Alerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Success      200  {object}  http.Response{data=[]repository.Channel}  "Channels retrieved successfully"
// @Failure      500  {object}  http.InternalServerErrorResponse          "Internal server error"
// @Router       /alerts/channels [get]
func (h *AlertHandler) GetAllChannels(c *gin.Context) {
	ctx := c.Request.Context()

	repo := repository.New(h.srv.DB)
	channels, err := repo.GetAllChannels(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, channels, http.WithMessage("Channels retrieved successfully"))
}

// GetAlertByID godoc
//
// @Summary      Retrieve a specific alert by ID
// @Description  Fetch a single alert by its UUID for the authenticated user
// @Tags         Alerts
// @Security     ApiKeyAuth
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Alert ID (UUID)"
// @Success      200  {object}  http.Response{data=repository.Alert}  "Alert retrieved successfully"
// @Failure      400  {object}  map[string]string                     "Invalid UUID format"
// @Failure      500  {object}  http.InternalServerErrorResponse      "Internal server error"
// @Router       /alerts/{id} [get]
func (h *AlertHandler) GetAlertByID(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid UUID format"), http.WithMessage("Invalid UUID format"))
		return
	}

	alert, err := h.alertService.GetAlertByID(ctx, id, userID)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, alert, http.WithMessage("Alert retrieved successfully"))
}
