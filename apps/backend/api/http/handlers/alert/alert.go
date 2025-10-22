package alerts

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"backend/internal/domain"
	"context"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/golodash/galidator/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
)

type AlertHandler struct {
	srv *http.Server
}

func NewAlertHandler(srv *http.Server) *AlertHandler {
	return &AlertHandler{srv: srv}
}

func (h *AlertHandler) beginTx(ctx context.Context) (repository.DBTX, func(), error) {
	conn, err := h.srv.DB.Acquire(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to acquire connection: %w", err)
	}
	cleanup := func() { conn.Release() }

	tx, err := conn.Begin(ctx)
	if err != nil {
		cleanup()
		return nil, nil, fmt.Errorf("failed to begin transaction: %w", err)
	}

	return tx, func() { tx.Rollback(ctx); cleanup() }, nil
}

// CreateAlert godoc
//
// @Summary        Create a new alert
// @Description    Add an alert for a specific asset and metric
// @Tags           Alerts
// @Security       ApiKeyAuth
// @Accept         json
// @Produce        json
// @Param          AlertRequest    body        repository.CreateAlertParams    true    "Alert data"
// @Success        201             {object}    http.Response{data=repository.Alert}    "Alert created successfully"
// @Failure        400             {object}    map[string]string                            "Invalid request data"
// @Failure        409             {object}    map[string]string                            "Alert already exists"
// @Failure        500             {object}    http.InternalServerErrorResponse            "Internal server error"
// @Router         /alerts [post]
func (h *AlertHandler) CreateAlert(c *gin.Context) {
	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
	})
	customizer := g.Validator(repository.CreateAlertParams{})

	var req repository.CreateAlertParams
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
	ctx := context.Background()

	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer cleanup()

	txRepo := repository.New(tx)

	alert, err := txRepo.CreateAlert(ctx, req)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == domain.UniqueViolation {
			http.SendConflict(c, err, http.WithMessage("Alert already exists"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	if txObj, ok := tx.(interface{ Commit(context.Context) error }); ok {
		if err := txObj.Commit(ctx); err != nil {
			http.SendInternalServerError(c, err)
			return
		}
	} else {
		http.SendInternalServerError(c, fmt.Errorf("transaction doesn't support commit"))
		return
	}

	http.SendCreated(c, alert, http.WithMessage("Alert created successfully"))
}

// GetUserAlerts godoc
//
// @Summary        Get user's alerts
// @Description    Retrieve all alerts for the authenticated user
// @Tags           Alerts
// @Security       ApiKeyAuth
// @Produce        json
// @Success        200    {object}    http.Response{data=[]repository.Alert}    "User alerts retrieved"
// @Failure        500    {object}    http.InternalServerErrorResponse        "Internal server error"
// @Router         /alerts [get]
func (h *AlertHandler) GetUserAlerts(c *gin.Context) {
	userID, err := domain.GetUserIDFromContext(c)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("error getting userID"))
		return
	}
	ctx := context.Background()

	repo := repository.New(h.srv.DB)
	alerts, err := repo.GetAlertsByUserId(ctx, userID)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, alerts, http.WithMessage("User alerts retrieved successfully"))
}

// GetAlertByID godoc
//
// @Summary        Get an alert by ID
// @Description    Retrieve a single alert by its UUID
// @Tags           Alerts
// @Security       ApiKeyAuth
// @Produce        json
// @Param          id    path        string    true    "Alert ID (UUID)"
// @Success        200   {object}    http.Response{data=repository.Alert}    "Alert retrieved"
// @Failure        400   {object}    map[string]string                        "Invalid UUID"
// @Failure        404   {object}    map[string]string                        "Alert not found"
// @Failure        500   {object}    http.InternalServerErrorResponse        "Internal server error"
// @Router         /alerts/{id} [get]
func (h *AlertHandler) GetAlertByID(c *gin.Context) {
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
	ctx := context.Background()

	repo := repository.New(h.srv.DB)
	alert, err := repo.GetAlertById(ctx, repository.GetAlertByIdParams{
		ID:     id,
		UserID: userID,
	})
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, alert, http.WithMessage("Alert retrieved successfully"))
}

// UpdateAlert godoc
//
// @Summary        Update an alert
// @Description    Update an existing alert for the authenticated user
// @Tags           Alerts
// @Security       ApiKeyAuth
// @Accept         json
// @Produce        json
// @Param          AlertRequest    body        repository.UpdateAlertParams    true    "Updated alert data"
// @Success        200             {object}    http.Response{data=repository.Alert}    "Alert updated successfully"
// @Failure        400             {object}    map[string]string                            "Invalid request data"
// @Failure        404             {object}    map[string]string                            "Alert not found"
// @Failure        500             {object}    http.InternalServerErrorResponse            "Internal server error"
// @Router         /alerts/{id} [put]
func (h *AlertHandler) UpdateAlert(c *gin.Context) {
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

	var req repository.UpdateAlertParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, err)
		return
	}
	req.ID = id
	req.UserID = userID
	ctx := context.Background()

	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer cleanup()

	txRepo := repository.New(tx)
	alert, err := txRepo.UpdateAlert(ctx, req)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	if txObj, ok := tx.(interface{ Commit(context.Context) error }); ok {
		if err := txObj.Commit(ctx); err != nil {
			http.SendInternalServerError(c, err)
			return
		}
	} else {
		http.SendInternalServerError(c, fmt.Errorf("transaction doesn't support commit"))
		return
	}

	http.SendSuccess(c, alert, http.WithMessage("Alert updated successfully"))
}

// DeleteAlert godoc
//
// @Summary        Delete an alert
// @Description    Delete a specific alert by ID
// @Tags           Alerts
// @Security       ApiKeyAuth
// @Param          id    path        string    true    "Alert ID (UUID)"
// @Success        200   {object}    http.Response    "Alert deleted successfully"
// @Failure        400   {object}    map[string]string                        "Invalid UUID"
// @Failure        404   {object}    map[string]string                        "Alert not found"
// @Failure        500   {object}    http.InternalServerErrorResponse        "Internal server error"
// @Router         /alerts/{id} [delete]
func (h *AlertHandler) DeleteAlert(c *gin.Context) {
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
	ctx := context.Background()

	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer cleanup()

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

	err = txRepo.DeleteAlert(ctx, repository.DeleteAlertParams{
		ID:     id,
		UserID: userID,
	})
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	if txObj, ok := tx.(interface{ Commit(context.Context) error }); ok {
		if err := txObj.Commit(ctx); err != nil {
			http.SendInternalServerError(c, err)
			return
		}
	} else {
		http.SendInternalServerError(c, fmt.Errorf("transaction doesn't support commit"))
		return
	}

	http.SendSuccess(c, nil, http.WithMessage("Alert deleted successfully"))
}

func StringsToUUIDs(strs []string) ([]uuid.UUID, error) {
	uuids := make([]uuid.UUID, len(strs))
	for i, s := range strs {
		id, err := uuid.Parse(s)
		if err != nil {
			return nil, fmt.Errorf("invalid UUID: %s", s)
		}
		uuids[i] = id
	}
	return uuids, nil
}
