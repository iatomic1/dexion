package hodlmm

import (
	"backend/api/http"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type UpdateHodlmmStatusRequest struct {
	ID                string  `json:"id" binding:"required"`
	LastKnownStatus   string  `json:"lastKnownStatus" binding:"required"`
	LastKnownValueUsd float64 `json:"lastKnownValueUsd"`
}

// UpdateHodlmmAlertStatus godoc
//
// @Summary      Update HODLMM alert internal status
// @Description  Internal endpoint to update the status (in-range/out-of-range) of an alert
// @Tags         HodlmmAlerts
// @Accept       json
// @Produce      json
// @Param        status  body      UpdateHodlmmStatusRequest  true  "Status update data"
// @Success      200     {object}  http.Response              "Status updated"
// @Failure      400     {object}  map[string]string          "Invalid request"
// @Failure      500     {object}  http.InternalServerErrorResponse  "Internal error"
// @Router       /hodlmm/alerts/status [patch]
func (h *HodlmmHandler) UpdateHodlmmAlertStatus(c *gin.Context) {
	ctx := c.Request.Context()

	var req UpdateHodlmmStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, err)
		return
	}

	id, err := uuid.Parse(req.ID)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid UUID"), http.WithMessage("Invalid UUID"))
		return
	}

	valueUSD := pgtype.Numeric{}
	valueUSD.Scan(fmt.Sprintf("%f", req.LastKnownValueUsd))

	alert, err := h.hodlmmService.UpdateHodlmmAlertStatus(ctx, id, req.LastKnownStatus, valueUSD)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, alert, http.WithMessage("Status updated successfully"))
}
