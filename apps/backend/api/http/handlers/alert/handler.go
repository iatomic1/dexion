package alerts

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type AlertHandler struct {
	srv *http.Server
}

type AlertChannel struct {
	ID string `json:"id"`
}

type CachedAlert struct {
	ID         string `json:"id"`
	UserID     string `json:"userId"`
	Metric     string `json:"metric"`
	Operator   string `json:"operator"`
	Value      string `json:"value"`
	Ca         string `json:"ca"`
	Repeatable bool   `json:"repeatable"`
	Status     string `json:"status"`
	UpdatedAt  string `json:"updatedAt"`
	CreatedAt  string `json:"createdAt"`
	Channels   string `json:"channels"`
}

type CreateAlertWithChannelsParams struct {
	repository.CreateAlertParams
	Channels []string `json:"channels"`
}

type UpdateAlertWithChannelsParams struct {
	repository.UpdateAlertParams
	Channels []string `json:"channels"`
}

type AlertWithChannels struct {
	*repository.Alert
	Channels []string
}

type UpdateAlertParams struct {
	ID         uuid.UUID `json:"-"`                // set from path, not JSON
	UserID     string    `json:"-"`                // set from context, not JSON
	Metric     *string   `json:"metric,omitempty"` // nil if not sent
	Operator   *string   `json:"operator,omitempty"`
	Value      *string   `json:"value,omitempty"`
	Ca         *string   `json:"ca,omitempty"`
	Repeatable *bool     `json:"repeatable,omitempty"`
	Status     *string   `json:"status,omitempty"`
}

const (
	alertKeyPrefix   = "alert:"
	userAlertsPrefix = "user_alerts:"
	cacheTTL         = 24 * time.Hour
)

func (h *AlertHandler) getAlertCacheKey(id uuid.UUID) string {
	return alertKeyPrefix + id.String()
}

func NewAlertHandler(srv *http.Server) *AlertHandler {
	return &AlertHandler{srv: srv}
}

func (h *AlertHandler) beginTx(ctx context.Context) (repository.DBTX, func(success bool), error) {
	conn, err := h.srv.DB.Acquire(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to acquire connection: %w", err)
	}

	tx, err := conn.Begin(ctx)
	if err != nil {
		conn.Release()
		return nil, nil, fmt.Errorf("failed to begin transaction: %w", err)
	}

	cleanup := func(success bool) {
		if success {
			if err := tx.Commit(ctx); err != nil {
				log.Printf("transaction commit failed: %v", err)
			}
		} else {
			if err := tx.Rollback(ctx); err != nil && !errors.Is(err, pgx.ErrTxClosed) {
				log.Printf("transaction rollback failed: %v", err)
			}
		}
		conn.Release()
	}

	return tx, cleanup, nil
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
