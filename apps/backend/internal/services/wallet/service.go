package wallet

import (
	"backend/internal/db/repository"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
)

type Service interface {
	TrackWallet(ctx context.Context, userID string, walletAddress string, nickname string, emoji *string) (*repository.UserWallet, error)
	GetTrackedWallets(ctx context.Context, userID string) ([]*repository.GetUserTrackedWalletsRow, error)
	GetAllWallets(ctx context.Context) ([]*repository.GetAllWalletsAndWatchersRow, error)
	GetWalletWatchers(ctx context.Context, walletAddress string) ([]*repository.GetWatchersForWalletRow, error)
	GetTrackedWalletsTelegram(ctx context.Context, chatID string) ([]*repository.GetTrackedWalletsTelegramRow, error)
	UpdateWalletPreferences(ctx context.Context, userID string, walletAddress string, nickname string, notifications bool) (*repository.UserWallet, error)
	UpdateTelegramUserPreference(ctx context.Context, arg repository.UpdateTelegramUserPreferenceParams) (*repository.TelegramUser, error)
	UntrackWallet(ctx context.Context, userID string, walletAddress string) error
	UntrackWalletTelegram(ctx context.Context, chatID string, walletAddress string) error
	CreateTelegramUser(ctx context.Context, arg repository.CreateTelegramUserParams) (*repository.TelegramUser, error)
	TrackWalletTelegram(ctx context.Context, arg repository.UpsertTelegramUserWalletParams) (*repository.TelegramUserWallet, error)
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

func (s *service) TrackWallet(ctx context.Context, userID string, walletAddress string, nickname string, emoji *string) (*repository.UserWallet, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	qtx := repository.New(tx)

	isTracking, err := qtx.IsTrackingWallet(ctx, repository.IsTrackingWalletParams{
		UserID:        userID,
		WalletAddress: walletAddress,
	})
	if err != nil {
		return nil, err
	}
	if isTracking {
		return nil, fmt.Errorf("wallet already tracked")
	}

	_, err = qtx.CreateWallet(ctx, walletAddress)
	if err != nil {
		return nil, err
	}

	userWallet, err := qtx.UpsertUserWallet(ctx, repository.UpsertUserWalletParams{
		UserID:        userID,
		WalletAddress: walletAddress,
		Nickname:      nickname,
		Emoji:         emoji,
	})
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return userWallet, nil
}

func (s *service) GetTrackedWallets(ctx context.Context, userID string) ([]*repository.GetUserTrackedWalletsRow, error) {
	repo := repository.New(s.db)
	return repo.GetUserTrackedWallets(ctx, userID)
}

func (s *service) GetAllWallets(ctx context.Context) ([]*repository.GetAllWalletsAndWatchersRow, error) {
	repo := repository.New(s.db)
	return repo.GetAllWalletsAndWatchers(ctx)
}

func (s *service) GetWalletWatchers(ctx context.Context, walletAddress string) ([]*repository.GetWatchersForWalletRow, error) {
	repo := repository.New(s.db)
	return repo.GetWatchersForWallet(ctx, walletAddress)
}

func (s *service) GetTrackedWalletsTelegram(ctx context.Context, chatID string) ([]*repository.GetTrackedWalletsTelegramRow, error) {
	repo := repository.New(s.db)
	return repo.GetTrackedWalletsTelegram(ctx, chatID)
}

func (s *service) UpdateWalletPreferences(ctx context.Context, userID string, walletAddress string, nickname string, notifications bool) (*repository.UserWallet, error) {
	repo := repository.New(s.db)

	isTracking, err := repo.IsTrackingWallet(ctx, repository.IsTrackingWalletParams{
		UserID:        userID,
		WalletAddress: walletAddress,
	})
	if err != nil {
		return nil, err
	}
	if !isTracking {
		return nil, fmt.Errorf("wallet not tracked")
	}

	return repo.UpdateWalletPreferences(ctx, repository.UpdateWalletPreferencesParams{
		ID:            userID,
		WalletAddress: walletAddress,
		Nickname:      nickname,
		Notifications: notifications,
	})
}

func (s *service) UpdateTelegramUserPreference(ctx context.Context, arg repository.UpdateTelegramUserPreferenceParams) (*repository.TelegramUser, error) {
	repo := repository.New(s.db)
	return repo.UpdateTelegramUserPreference(ctx, arg)
}

func (s *service) UntrackWallet(ctx context.Context, userID string, walletAddress string) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	qtx := repository.New(tx)

	isTracking, err := qtx.IsTrackingWallet(ctx, repository.IsTrackingWalletParams{
		UserID:        userID,
		WalletAddress: walletAddress,
	})
	if err != nil {
		return err
	}
	if !isTracking {
		return fmt.Errorf("wallet not tracked")
	}

	err = qtx.UntrackWallet(ctx, repository.UntrackWalletParams{
		UserID:        userID,
		WalletAddress: walletAddress,
	})
	if err != nil {
		return err
	}

	err = qtx.CleanupOrphanedWallet(ctx, walletAddress)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (s *service) UntrackWalletTelegram(ctx context.Context, chatID string, walletAddress string) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	qtx := repository.New(tx)

	isTracking, err := qtx.IsTrackingWalletTelegram(ctx, repository.IsTrackingWalletTelegramParams{
		ChatID:        chatID,
		WalletAddress: walletAddress,
	})
	if err != nil {
		return err
	}
	if !isTracking {
		return fmt.Errorf("wallet not tracked by this user")
	}

	err = qtx.UntrackWalletTelegram(ctx, repository.UntrackWalletTelegramParams{
		ChatID:        chatID,
		WalletAddress: walletAddress,
	})
	if err != nil {
		return err
	}

	err = qtx.CleanupOrphanedWallet(ctx, walletAddress)
	if err != nil {
		s.logger.Error().Err(err).Msgf("Failed to cleanup orphaned wallet %s", walletAddress)
	}

	return tx.Commit(ctx)
}

func (s *service) CreateTelegramUser(ctx context.Context, arg repository.CreateTelegramUserParams) (*repository.TelegramUser, error) {
	repo := repository.New(s.db)
	return repo.CreateTelegramUser(ctx, arg)
}

func (s *service) TrackWalletTelegram(ctx context.Context, arg repository.UpsertTelegramUserWalletParams) (*repository.TelegramUserWallet, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	qtx := repository.New(tx)

	userWallet, err := qtx.UpsertTelegramUserWallet(ctx, arg)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return userWallet, nil
}
