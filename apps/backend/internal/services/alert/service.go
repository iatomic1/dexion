package alert

import (
	"backend/internal/db/repository"
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

type Service interface {
	CreateAlert(ctx context.Context, params repository.CreateAlertParams, channels []string) (*repository.Alert, error)
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

func NewService(db *pgxpool.Pool, rdb *redis.Client, logger zerolog.Logger) Service {
	return &service{
		db:     db,
		rdb:    rdb,
		logger: logger,
	}
}

func (s *service) GetUserChannelsFromCache(ctx context.Context, userID string) (map[string]string, error) {
	key := "user-" + userID
	data, err := s.rdb.HGetAll(ctx, key).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get user channels from redis: %w", err)
	}
	return data, nil
}

func (s *service) CreateAlert(ctx context.Context, params repository.CreateAlertParams, channels []string) (*repository.Alert, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx) // Rollback is a no-op if the transaction is already committed.

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

	return alert, nil
}

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

	return alert, nil
}

func (s *service) DeleteAlerts(ctx context.Context, ids []uuid.UUID, userID string) ([]*repository.Alert, error) {
	repo := repository.New(s.db)
	return repo.DeleteAlerts(ctx, repository.DeleteAlertsParams{
		Ids:    ids,
		UserID: userID,
	})
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
	return repo.UpdateAlertStatus(ctx, repository.UpdateAlertStatusParams{
		ID:     alertID,
		UserID: userID,
		Status: status,
	})
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
