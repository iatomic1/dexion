package alerts

import (
	"backend/api/http"
	"backend/internal/domain"
	"errors"
	_ "backend/internal/db/repository"

	"github.com/gin-gonic/gin"
	"github.com/golodash/galidator/v2"
	"github.com/jackc/pgx/v5/pgconn"
)

// CreateAlert godoc
//
// @Summary        Create a new alert
// @Description    Create a new alert with optional notification channels
// @Tags           Alerts
// @Security       ApiKeyAuth
// @Accept         json
// @Produce        json
// @Param          AlertRequest    body        CreateAlertWithChannelsParams    true    "Alert data with channels"
// @Success        201             {object}    http.Response{data=repository.Alert}    "Alert created successfully"
// @Failure        400             {object}    map[string]string                        "Invalid request data"
// @Failure        409             {object}    map[string]string                        "Alert already exists"
// @Failure        500             {object}    http.InternalServerErrorResponse        "Internal server error"
// @Router         /alerts [post]
func (h *AlertHandler) CreateAlert(c *gin.Context, userID string) {
	ctx := c.Request.Context()

	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
	})
	customizer := g.Validator(CreateAlertWithChannelsParams{})

	var req CreateAlertWithChannelsParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	req.UserID = userID

	alert, err := h.alertService.CreateAlert(ctx, req.CreateAlertParams, req.Channels)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == domain.UniqueViolation {
			http.SendConflict(c, err, http.WithMessage("Alert already exists"))
			return
		}
		http.SendInternalServerError(c, err, http.WithMessage("Failed to create alert"))
		return
	}

	h.cacheAlert(ctx, alert, req.Channels)

	http.SendCreated(c, alert, http.WithMessage("Alert created successfully"))
}
