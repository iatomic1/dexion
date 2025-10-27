package webhook

import (
	"backend/internal/db/repository"
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
)

type Service interface {
	CreateWebhookConfig(ctx context.Context, params repository.CreateWebhookConfigParams) (*repository.WebhookConfig, error)
	GetWebhookConfig(ctx context.Context, userID string) (*repository.WebhookConfig, error)
	UpdateWebhookConfig(ctx context.Context, params repository.UpdateWebhookConfigParams) (*repository.WebhookConfig, error)
	DeleteWebhookConfig(ctx context.Context, userID string) error
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

func (s *service) CreateWebhookConfig(ctx context.Context, params repository.CreateWebhookConfigParams) (*repository.WebhookConfig, error) {
	q := repository.New(s.db)
	return q.CreateWebhookConfig(ctx, params)
}

func (s *service) GetWebhookConfig(ctx context.Context, userID string) (*repository.WebhookConfig, error) {
	q := repository.New(s.db)
	return q.GetWebhookConfigByUserID(ctx, userID)
}

func (s *service) UpdateWebhookConfig(ctx context.Context, params repository.UpdateWebhookConfigParams) (*repository.WebhookConfig, error) {
	q := repository.New(s.db)
	return q.UpdateWebhookConfig(ctx, params)
}

func (s *service) DeleteWebhookConfig(ctx context.Context, userID string) error {
	q := repository.New(s.db)
	_, err := q.GetWebhookConfigByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return fmt.Errorf("webhook config not found")
		}
		return err
	}
	return q.DeleteWebhookConfig(ctx, userID)
}
