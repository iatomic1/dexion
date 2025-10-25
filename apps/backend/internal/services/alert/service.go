package alert

import (
	"backend/internal/db/repository"
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
)

type Service interface {
	CreateAlert(ctx context.Context, params repository.CreateAlertParams, channels []string) (*repository.Alert, error)
	DeleteAlert(ctx context.Context, id uuid.UUID, userID string) (*repository.Alert, error)
	UpdateAlert(ctx context.Context, params repository.UpdateAlertParams, channels []uuid.UUID) (*repository.Alert, error)
	GetUserAlerts(ctx context.Context, userID string) ([]*repository.GetUserAlertsRow, error)
	GetAlertByID(ctx context.Context, id uuid.UUID, userID string) (*repository.Alert, error)
}

type service struct {
	db     *pgxpool.Pool
	logger zerolog.Logger
}

func NewService(db *pgxpool.Pool, logger zerolog.Logger) Service {
	return &service{
		db:     db,
		logger: logger,
	}
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

	exists, err := qtx.HasAlert(ctx, repository.HasAlertParams{
		ID:     id,
		UserID: userID,
	})
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, fmt.Errorf("alert not found")
	}

	alert, err := qtx.DeleteAlert(ctx, repository.DeleteAlertParams{
		ID:     id,
		UserID: userID,
	})
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return alert, nil
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
