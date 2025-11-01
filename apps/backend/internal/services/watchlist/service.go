package watchlist

import (
	"backend/internal/db/repository"
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
)

type Service interface {
	CreateWatchlist(ctx context.Context, params repository.CreateWatchlistParams) (*repository.Watchlist, error)
	GetUserWatchlists(ctx context.Context, userID string) ([]*repository.Watchlist, error)
	DeleteWatchlist(ctx context.Context, id uuid.UUID, userID string) error
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

func (s *service) CreateWatchlist(ctx context.Context, params repository.CreateWatchlistParams) (*repository.Watchlist, error) {
	q := repository.New(s.db)
	watchlist, err := q.CreateWatchlist(ctx, params)
	if err != nil {
		return nil, err
	}

	return watchlist, nil
}

func (s *service) GetUserWatchlists(ctx context.Context, userID string) ([]*repository.Watchlist, error) {
	repo := repository.New(s.db)
	return repo.GetWatchlistsByUserId(ctx, &userID)
}

func (s *service) DeleteWatchlist(ctx context.Context, id uuid.UUID, userID string) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	qtx := repository.New(tx)

	exists, err := qtx.HasWatchlistById(ctx, repository.HasWatchlistByIdParams{
		ID:     id,
		UserID: &userID,
	})
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("watchlist entry not found")
	}

	err = qtx.DeleteWatchlist(ctx, repository.DeleteWatchlistParams{ID: id, UserID: &userID})
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
