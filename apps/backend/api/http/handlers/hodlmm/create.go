package hodlmm

import (
	"backend/api/http"
	_ "backend/internal/db/repository"
	"backend/internal/services/hodlmm"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/golodash/galidator/v2"
)

type CreateHodlmmAlertItem struct {
	StacksAddress       string  `json:"stacksAddress" binding:"required"`
	PoolID              string  `json:"poolId" binding:"required"`
	PoolContract        string  `json:"poolContract" binding:"required"`
	DisplayName         string  `json:"displayName" binding:"required"`
	TokenXSymbol        *string `json:"tokenXSymbol"`
	TokenYSymbol        *string `json:"tokenYSymbol"`
	NotifyViaWebapp     bool    `json:"notifyViaWebapp"`
	NotifyViaTelegram   bool    `json:"notifyViaTelegram"`
	NotifyViaEmail      bool    `json:"notifyViaEmail"`
	NotifyViaWebhook    bool    `json:"notifyViaWebhook"`
	NotifyOnOutOfRange  bool    `json:"notifyOnOutOfRange"`
	NotifyOnBackInRange bool    `json:"notifyOnBackInRange"`
	LastKnownStatus     string  `json:"lastKnownStatus" binding:"required,oneof=in-range out-of-range"`
}

type CreateHodlmmAlertsRequest struct {
	Alerts []CreateHodlmmAlertItem `json:"alerts" binding:"required,min=1,dive"`
}

// CreateHodlmmAlerts godoc
//
// @Summary        Create multiple HODLMM alerts
// @Description    Create multiple position monitoring alerts for the authenticated user
// @Tags         HodlmmAlerts
// @Security       ApiKeyAuth
// @Accept         json
// @Produce        json
// @Param          AlertsRequest   body        CreateHodlmmAlertsRequest    true    "List of alerts"
// @Success        201             {object}    http.Response{data=[]repository.HodlmmAlert}    "Alerts created successfully"
// @Failure        400             {object}    map[string]string                                "Invalid request data"
// @Failure        500             {object}    http.InternalServerErrorResponse                "Internal server error"
// @Router         /hodlmm/alerts [post]
func (h *HodlmmHandler) CreateHodlmmAlerts(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
	})
	customizer := g.Validator(CreateHodlmmAlertsRequest{})

	var req CreateHodlmmAlertsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	// Map request to service params
	serviceParams := make([]hodlmm.CreateHodlmmAlertParams, len(req.Alerts))
	for i, item := range req.Alerts {
		serviceParams[i] = hodlmm.CreateHodlmmAlertParams{
			StacksAddress:       item.StacksAddress,
			PoolID:              item.PoolID,
			PoolContract:        item.PoolContract,
			DisplayName:         item.DisplayName,
			TokenXSymbol:        item.TokenXSymbol,
			TokenYSymbol:        item.TokenYSymbol,
			NotifyViaWebapp:     item.NotifyViaWebapp,
			NotifyViaTelegram:   item.NotifyViaTelegram,
			NotifyViaEmail:      item.NotifyViaEmail,
			NotifyViaWebhook:    item.NotifyViaWebhook,
			NotifyOnOutOfRange:  item.NotifyOnOutOfRange,
			NotifyOnBackInRange: item.NotifyOnBackInRange,
			LastKnownStatus:     item.LastKnownStatus,
		}
	}

	alerts, err := h.hodlmmService.CreateHodlmmAlerts(ctx, userID, serviceParams)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("Failed to create alerts"))
		return
	}

	http.SendCreated(c, alerts, http.WithMessage(fmt.Sprintf("%d alerts created successfully", len(alerts))))
}
