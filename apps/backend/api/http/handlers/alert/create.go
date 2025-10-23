package alerts

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"backend/internal/domain"
	"backend/pkg/cacheutil"
	"errors"
	"fmt"
	"strings"
	"time"

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
func (h *AlertHandler) CreateAlert(c *gin.Context) {
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

	userID, err := domain.GetUserIDFromContext(c)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("error getting userID"))
		return
	}
	req.UserID = userID

	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	success := false
	defer cleanup(success)

	txRepo := repository.New(tx)

	alert, err := txRepo.CreateAlert(ctx, req.CreateAlertParams)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == domain.UniqueViolation {
			http.SendConflict(c, err, http.WithMessage("Alert already exists"))
			return
		}
		http.SendInternalServerError(c, err, http.WithMessage("Failed to create alert"))
		return
	}

	if len(req.Channels) > 0 {
		channelUUIDs, err := StringsToUUIDs(req.Channels)
		if err != nil {
			http.SendBadRequest(c, err, http.WithMessage("Invalid channel UUID(s)"))
			return
		}

		err = txRepo.CreateAlertChannels(ctx, repository.CreateAlertChannelsParams{AlertID: alert.ID, Column2: channelUUIDs})
		if err != nil {
			http.SendInternalServerError(c, err, http.WithMessage("Failed to link channels"))
			return
		}
	}

	success = true
	cleanup(success)

	cachedAlert := CachedAlert{
		ID:         alert.ID.String(),
		UserID:     alert.UserID,
		Metric:     alert.Metric,
		Operator:   alert.Operator,
		Value:      alert.Value,
		Ca:         alert.Ca,
		Repeatable: alert.Repeatable,
		Status:     alert.Status,
		UpdatedAt:  alert.UpdatedAt.Format(time.RFC3339),
		CreatedAt:  alert.CreatedAt.Format(time.RFC3339),
		Channels:   strings.Join(req.Channels, ","),
	}

	err = cacheutil.CacheStruct(ctx, h.srv.RDB, h.getAlertCacheKey(alert.ID), cachedAlert)
	if err != nil {
		fmt.Println("cache failed:", err)
	} else {
		caKey := fmt.Sprintf("alerts_by_ca:%s", alert.Ca)
		if err := h.srv.RDB.SAdd(ctx, caKey, alert.ID.String()).Err(); err != nil {
			fmt.Println("failed to add to alerts_by_ca:", err)
		}
	}

	http.SendCreated(c, alert, http.WithMessage("Alert created successfully"))
}
