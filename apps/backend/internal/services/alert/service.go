package alert

import (
	"backend/internal/db/repository"
	"backend/pkg/cacheutil"
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

type Service interface {
	CreateAlert(ctx context.Context, params repository.CreateAlertParams, channels []string) (*repository.Alert, error)
	// SyncAlertsFromPositions(ctx context.Context, userID string) (*[]repository.Alert, error)
	DeleteAlert(ctx context.Context, id uuid.UUID, userID string) (*repository.Alert, error)
	DeleteAlerts(ctx context.Context, ids []uuid.UUID, userID string) ([]*repository.Alert, error)
	UpdateAlert(ctx context.Context, params repository.UpdateAlertParams, channels []uuid.UUID) (*repository.Alert, error)
	UpdateAlertStatus(ctx context.Context, alertID uuid.UUID, userID string, status string) (*repository.Alert, error)
	GetUserAlerts(ctx context.Context, userID string) ([]*repository.GetUserAlertsRow, error)
	GetAlertByID(ctx context.Context, id uuid.UUID, userID string) (*repository.Alert, error)
	GetUserChannelsFromCache(ctx context.Context, userID string) (map[string]string, error)
}

type service struct {
	db     *pgxpool.Pool
	rdb    *redis.Client
	logger zerolog.Logger
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
	Type       string `json:"type"`
	UpdatedAt  string `json:"updatedAt"`
	CreatedAt  string `json:"createdAt"`
	Channels   string `json:"channels"`
}

const (
	alertKeyPrefix   = "alert:"
	alertsByCaPrefix = "alerts_by_ca:"
	cacheTTL         = 24 * time.Hour
)

func NewService(db *pgxpool.Pool, rdb *redis.Client, logger zerolog.Logger) Service {
	return &service{
		db:     db,
		rdb:    rdb,
		logger: logger,
	}
}

// Caching Helpers

func (s *service) getAlertCacheKey(id uuid.UUID) string {
	return alertKeyPrefix + id.String()
}

func (s *service) getAlertsByCaKey(ca string) string {
	return alertsByCaPrefix + ca
}

func (s *service) cacheAlert(ctx context.Context, alert *repository.Alert, channels []string) {
	cachedAlert := CachedAlert{
		ID:        alert.ID.String(),
		UserID:    alert.UserID,
		Metric:    alert.Metric,
		Operator:  alert.Operator,
		Value:     alert.Value,
		Ca:        alert.Ca,
		Status:    alert.Status,
		Type:      alert.Type,
		UpdatedAt: alert.UpdatedAt.Format(time.RFC3339),
		CreatedAt: alert.CreatedAt.Format(time.RFC3339),
		Channels:  strings.Join(channels, ","),
	}
	if alert.Repeatable != nil {
		cachedAlert.Repeatable = *alert.Repeatable
	}

	err := cacheutil.CacheStruct(ctx, s.rdb, s.getAlertCacheKey(alert.ID), cachedAlert)
	if err != nil {
		s.logger.Error().Err(err).Msg("cache failed")
	} else {
		caKey := s.getAlertsByCaKey(alert.Ca)
		if err := s.rdb.SAdd(ctx, caKey, alert.ID.String()).Err(); err != nil {
			s.logger.Error().Err(err).Msg("failed to add to alerts_by_ca")
		}
	}
}

func (s *service) updateCachedAlert(ctx context.Context, alert *repository.Alert, channels []uuid.UUID) {
	cachedAlert := CachedAlert{
		ID:        alert.ID.String(),
		UserID:    alert.UserID,
		Metric:    alert.Metric,
		Operator:  alert.Operator,
		Value:     alert.Value,
		Ca:        alert.Ca,
		Status:    alert.Status,
		UpdatedAt: alert.UpdatedAt.Format(time.RFC3339),
		CreatedAt: alert.CreatedAt.Format(time.RFC3339),
	}
	if alert.Repeatable != nil {
		cachedAlert.Repeatable = *alert.Repeatable
	}

	var ids []string
	for _, ch := range channels {
		ids = append(ids, ch.String())
	}
	cachedAlert.Channels = strings.Join(ids, ",")

	if err := cacheutil.CacheStruct(ctx, s.rdb, s.getAlertCacheKey(alert.ID), cachedAlert); err != nil {
		s.logger.Error().Err(err).Str("alertId", alert.ID.String()).Msg("cache update failed")
	}
}

func (s *service) updateCachedAlertStatus(ctx context.Context, alert *repository.Alert) {
	key := s.getAlertCacheKey(alert.ID)
	// Only update status and updatedAt, leaving channels and other fields intact
	updates := map[string]interface{}{
		"status":    alert.Status,
		"updatedAt": alert.UpdatedAt.Format(time.RFC3339),
	}
	if err := s.rdb.HSet(ctx, key, updates).Err(); err != nil {
		s.logger.Error().Err(err).Str("alertId", alert.ID.String()).Msg("failed to update alert status in cache")
	}
}

func (s *service) deleteCachedAlert(ctx context.Context, id uuid.UUID, ca string) {
	err := s.rdb.Del(ctx, s.getAlertCacheKey(id)).Err()
	if err != nil {
		s.logger.Error().Err(err).Msg("Failed to delete alert from redis")
	}
	caKey := s.getAlertsByCaKey(ca)
	if err := s.rdb.SRem(ctx, caKey, id.String()).Err(); err != nil {
		s.logger.Error().Err(err).Msg("redis srem failed")
	}
}

func (s *service) GetUserChannelsFromCache(ctx context.Context, userID string) (map[string]string, error) {
	// Fixed: key changed from "user-" to "user:" to match other handlers
	key := "user:" + userID
	data, err := s.rdb.HGetAll(ctx, key).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get user channels from redis: %w", err)
	}
	return data, nil
}

// Service Implementations

func (s *service) CreateAlert(ctx context.Context, params repository.CreateAlertParams, channels []string) (*repository.Alert, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	qtx := repository.New(tx)

	alert, err := qtx.CreateAlert(ctx, params)
	if err != nil {
		return nil, err
	}

	if len(channels) > 0 {
		channelUUIDs, err := stringsToUUIDs(channels)
		if err != nil {
			return nil, err
		}

		err = qtx.CreateAlertChannels(ctx, repository.CreateAlertChannelsParams{AlertID: alert.ID, Column2: channelUUIDs})
		if err != nil {
			return nil, fmt.Errorf("failed to link channels: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Cache the new alert
	s.cacheAlert(ctx, alert, channels)

	return alert, nil
}

type BitflowPositionsResponse struct {
	Positions []struct {
		PoolID        string  `json:"poolId"`
		PoolContract  string  `json:"poolContract"`
		PriceRangeMin float64 `json:"priceRangeMin"`
		PriceRangeMax float64 `json:"priceRangeMax"`
	} `json:"positions"`
}

// func (s *service) SyncAlertsFromPositions(ctx context.Context, userID string) (*[]repository.Alert, error) {
//   tx, err := s.db.Begin(ctx)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to begin transaction: %w", err)
// 	}
// 	defer tx.Rollback(ctx)

// 	qtx := repository.New(tx)

// 	user, err := qtx.GetUserById(ctx, userID)
// 	if err != nil {
// 	return nil, err
// 	}

// 	url := fmt.Sprintf(
// 		"https://hodlmm.bitflow.finance/api/bff-proxy/api/app/v1/users/%s/positions",
// 		user.ExternalAddress,
// 	)

// 	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
// 	if err != nil {
// 		return nil, err
// 	}

// 	resp, err := http.DefaultClient.Do(req)
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer resp.Body.Close()

// 	if resp.StatusCode != http.StatusOK {
// 		return nil, fmt.Errorf("bitflow returned status %d", resp.StatusCode)
// 	}

// 	var data BitflowPositionsResponse
// 	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
// 		return nil, err
// 	}

// }

func (s *service) DeleteAlert(ctx context.Context, id uuid.UUID, userID string) (*repository.Alert, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	qtx := repository.New(tx)

	alert, err := qtx.DeleteAlert(ctx, repository.DeleteAlertParams{
		ID:     id,
		UserID: userID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("alert not found")
		}
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Remove from cache
	s.deleteCachedAlert(ctx, alert.ID, alert.Ca)

	return alert, nil
}

func (s *service) DeleteAlerts(ctx context.Context, ids []uuid.UUID, userID string) ([]*repository.Alert, error) {
	repo := repository.New(s.db)
	alerts, err := repo.DeleteAlerts(ctx, repository.DeleteAlertsParams{
		Ids:    ids,
		UserID: userID,
	})
	if err != nil {
		return nil, err
	}

	// Remove each from cache
	for _, alert := range alerts {
		s.deleteCachedAlert(ctx, alert.ID, alert.Ca)
	}

	return alerts, nil
}

func (s *service) UpdateAlert(ctx context.Context, params repository.UpdateAlertParams, channels []uuid.UUID) (*repository.Alert, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	qtx := repository.New(tx)

	alert, err := qtx.UpdateAlert(ctx, params)
	if err != nil {
		return nil, err
	}

	err = qtx.DeleteAlertChannels(ctx, params.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to delete alert channels: %w", err)
	}

	_, err = qtx.InsertAlertChannels(ctx, repository.InsertAlertChannelsParams{
		AlertID: params.ID,
		Column2: channels,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to insert alert channels: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Update cache
	s.updateCachedAlert(ctx, alert, channels)

	return alert, nil
}

func (s *service) GetUserAlerts(ctx context.Context, userID string) ([]*repository.GetUserAlertsRow, error) {
	repo := repository.New(s.db)
	return repo.GetUserAlerts(ctx, userID)
}

func (s *service) GetAlertByID(ctx context.Context, id uuid.UUID, userID string) (*repository.Alert, error) {
	repo := repository.New(s.db)
	return repo.GetAlertById(ctx, repository.GetAlertByIdParams{
		ID:     id,
		UserID: userID,
	})
}

func (s *service) UpdateAlertStatus(ctx context.Context, alertID uuid.UUID, userID string, status string) (*repository.Alert, error) {
	repo := repository.New(s.db)
	alert, err := repo.UpdateAlertStatus(ctx, repository.UpdateAlertStatusParams{
		ID:     alertID,
		UserID: userID,
		Status: status,
	})
	if err != nil {
		return nil, err
	}

	// Partially update cache (preserving channels)
	s.updateCachedAlertStatus(ctx, alert)

	return alert, nil
}

func stringsToUUIDs(strs []string) ([]uuid.UUID, error) {
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
