package alerts

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"backend/internal/domain"
	"context"
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
func (h *AlertHandler) DeleteAlert(c *gin.Context) {
	ctx := c.Request.Context()

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid UUID format"), http.WithMessage("Invalid UUID format"))
		return
	}

	userID, err := domain.GetUserIDFromContext(c)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("error getting userID"))
		return
	}

	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	success := false
	defer cleanup(success)

	txRepo := repository.New(tx)
	exists, err := txRepo.HasAlert(ctx, repository.HasAlertParams{
		ID:     id,
		UserID: userID,
	})
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	if !exists {
		http.SendNotFound(c, fmt.Errorf("alert not found"), http.WithMessage("Alert not found"))
		return
	}

	alert, err := txRepo.DeleteAlert(ctx, repository.DeleteAlertParams{
		ID:     id,
		UserID: userID,
	})
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	if err := tx.(interface{ Commit(context.Context) error }).Commit(ctx); err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	success = true

	err = h.srv.RDB.Del(ctx, h.getAlertCacheKey(id)).Err()
	if err != nil {
		fmt.Println("Failed to delete alert from redis")
	}
	caKey := fmt.Sprintf("alerts_by_ca:%s", alert.Ca)
	if err := h.srv.RDB.SRem(ctx, caKey, idStr).Err(); err != nil {
		fmt.Println("redis srem failed:", err)
	}

	http.SendSuccess(c, nil, http.WithMessage("Alert deleted successfully"))
}
