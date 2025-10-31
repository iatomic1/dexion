package alerts

import (
	"backend/internal/db/repository"
	"backend/pkg/cacheutil"
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

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

const (
	alertKeyPrefix   = "alert:"
	alertsByCaPrefix = "alerts_by_ca:"
	cacheTTL         = 24 * time.Hour
)

func (h *AlertHandler) getAlertCacheKey(id uuid.UUID) string {
	return alertKeyPrefix + id.String()
}

func (h *AlertHandler) getAlertsByCaKey(ca string) string {
	return alertsByCaPrefix + ca
}

func (h *AlertHandler) cacheAlert(ctx context.Context, alert *repository.Alert, channels []string) {
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
		Channels:   strings.Join(channels, ","),
	}

	err := cacheutil.CacheStruct(ctx, h.srv.RDB, h.getAlertCacheKey(alert.ID), cachedAlert)
	if err != nil {
		h.logger.Error().Err(err).Msg("cache failed")
	} else {
		caKey := h.getAlertsByCaKey(alert.Ca)
		if err := h.srv.RDB.SAdd(ctx, caKey, alert.ID.String()).Err(); err != nil {
			h.logger.Error().Err(err).Msg("failed to add to alerts_by_ca")
		}
	}
}

func (h *AlertHandler) updateCachedAlert(ctx context.Context, alert *repository.Alert, channels []uuid.UUID) {
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
	}

	var ids []string
	for _, ch := range channels {
		ids = append(ids, ch.String())
	}
	cachedAlert.Channels = strings.Join(ids, ",")

	if err := cacheutil.CacheStruct(ctx, h.srv.RDB, h.getAlertCacheKey(alert.ID), cachedAlert); err != nil {
		h.logger.Error().Err(err).Str("alertId", alert.ID.String()).Msg("cache update failed")
	}
}

func (h *AlertHandler) deleteCachedAlert(ctx context.Context, id uuid.UUID, ca string) {
	err := h.srv.RDB.Del(ctx, h.getAlertCacheKey(id)).Err()
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to delete alert from redis")
	}
	caKey := h.getAlertsByCaKey(ca)
	if err := h.srv.RDB.SRem(ctx, caKey, id.String()).Err(); err != nil {
		h.logger.Error().Err(err).Msg("redis srem failed")
	}
}

func (h *AlertHandler) getUserChannels(ctx context.Context, userID string) (map[string]string, error) {
	key := "user:" + userID
	data, err := h.srv.RDB.HGetAll(ctx, key).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get user channels from redis: %w", err)
	}
	return data, nil
}
