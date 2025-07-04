// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.29.0
// source: wallets.sql

package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

const cleanupOrphanedWallet = `-- name: CleanupOrphanedWallet :exec
DELETE FROM wallets
WHERE address = $1
  AND NOT EXISTS (SELECT 1
                  FROM user_wallets
                  WHERE wallet_address = $1)
  AND NOT EXISTS (SELECT 1
                  FROM telegram_user_wallets
                  WHERE wallet_address = $1)
`

func (q *Queries) CleanupOrphanedWallet(ctx context.Context, address string) error {
	_, err := q.db.Exec(ctx, cleanupOrphanedWallet, address)
	return err
}

const createWallet = `-- name: CreateWallet :one
WITH ins AS (
  INSERT INTO wallets (address)
  VALUES ($1)
  ON CONFLICT (address) DO NOTHING
  RETURNING address, created_at
)
SELECT address, created_at FROM ins
UNION ALL
SELECT address, created_at FROM wallets WHERE address = $1
`

type CreateWalletRow struct {
	Address   string             `json:"address"`
	CreatedAt pgtype.Timestamptz `json:"createdAt"`
}

func (q *Queries) CreateWallet(ctx context.Context, address string) (*CreateWalletRow, error) {
	row := q.db.QueryRow(ctx, createWallet, address)
	var i CreateWalletRow
	err := row.Scan(&i.Address, &i.CreatedAt)
	return &i, err
}

const getAllWallets = `-- name: GetAllWallets :many
SELECT address, created_at FROM wallets
`

func (q *Queries) GetAllWallets(ctx context.Context) ([]*Wallet, error) {
	rows, err := q.db.Query(ctx, getAllWallets)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*Wallet
	for rows.Next() {
		var i Wallet
		if err := rows.Scan(&i.Address, &i.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getUserTrackedWallets = `-- name: GetUserTrackedWallets :many
SELECT w.address, uw.nickname, uw.emoji, uw.notifications, w.created_at
FROM user_wallets uw
JOIN wallets w ON uw.wallet_address = w.address
WHERE uw.user_id = $1
`

type GetUserTrackedWalletsRow struct {
	Address       string             `binding:"required" example:"SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1" json:"address"`
	Nickname      string             `binding:"required" example:"iatomic" json:"nickname"`
	Emoji         *string            `json:"emoji"`
	Notifications bool               `json:"notifications"`
	CreatedAt     pgtype.Timestamptz `json:"createdAt"`
}

func (q *Queries) GetUserTrackedWallets(ctx context.Context, userID string) ([]*GetUserTrackedWalletsRow, error) {
	rows, err := q.db.Query(ctx, getUserTrackedWallets, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*GetUserTrackedWalletsRow
	for rows.Next() {
		var i GetUserTrackedWalletsRow
		if err := rows.Scan(
			&i.Address,
			&i.Nickname,
			&i.Emoji,
			&i.Notifications,
			&i.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getUserWalletDetails = `-- name: GetUserWalletDetails :one
SELECT nickname, emoji, notifications
FROM user_wallets
WHERE user_id = $1 AND wallet_address = $2
`

type GetUserWalletDetailsParams struct {
	UserID        string `json:"userId"`
	WalletAddress string `binding:"required" example:"SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1" json:"walletAddress"`
}

type GetUserWalletDetailsRow struct {
	Nickname      string  `binding:"required" example:"iatomic" json:"nickname"`
	Emoji         *string `json:"emoji"`
	Notifications bool    `json:"notifications"`
}

func (q *Queries) GetUserWalletDetails(ctx context.Context, arg GetUserWalletDetailsParams) (*GetUserWalletDetailsRow, error) {
	row := q.db.QueryRow(ctx, getUserWalletDetails, arg.UserID, arg.WalletAddress)
	var i GetUserWalletDetailsRow
	err := row.Scan(&i.Nickname, &i.Emoji, &i.Notifications)
	return &i, err
}

const getWalletsWithWatchers = `-- name: GetWalletsWithWatchers :many
SELECT
  w.address,
  w.created_at,
  jsonb_build_object(
    'address', w.address,
    'created_at', w.created_at,
    'watchers', jsonb_agg(
      jsonb_build_object(
        'user_id', uw.user_id,
        'nickname', uw.nickname,
        'emoji', uw.emoji,
        'notifications', uw.notifications
      )
    )
  ) as wallet_with_watchers
FROM wallets w
JOIN user_wallets uw ON w.address = uw.wallet_address
GROUP BY w.address, w.created_at
HAVING COUNT(uw.user_id) > 0
`

type GetWalletsWithWatchersRow struct {
	Address            string             `binding:"required" example:"SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1" json:"address"`
	CreatedAt          pgtype.Timestamptz `json:"createdAt"`
	WalletWithWatchers []byte             `json:"walletWithWatchers"`
}

func (q *Queries) GetWalletsWithWatchers(ctx context.Context) ([]*GetWalletsWithWatchersRow, error) {
	rows, err := q.db.Query(ctx, getWalletsWithWatchers)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*GetWalletsWithWatchersRow
	for rows.Next() {
		var i GetWalletsWithWatchersRow
		if err := rows.Scan(&i.Address, &i.CreatedAt, &i.WalletWithWatchers); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getWatchersForWallet = `-- name: GetWatchersForWallet :many
SELECT user_id, nickname, emoji, notifications
FROM user_wallets
WHERE wallet_address = $1
`

type GetWatchersForWalletRow struct {
	UserID        string  `json:"userId"`
	Nickname      string  `binding:"required" example:"iatomic" json:"nickname"`
	Emoji         *string `json:"emoji"`
	Notifications bool    `json:"notifications"`
}

func (q *Queries) GetWatchersForWallet(ctx context.Context, walletAddress string) ([]*GetWatchersForWalletRow, error) {
	rows, err := q.db.Query(ctx, getWatchersForWallet, walletAddress)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*GetWatchersForWalletRow
	for rows.Next() {
		var i GetWatchersForWalletRow
		if err := rows.Scan(
			&i.UserID,
			&i.Nickname,
			&i.Emoji,
			&i.Notifications,
		); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const isTrackingWallet = `-- name: IsTrackingWallet :one
SELECT EXISTS(
  SELECT 1 FROM user_wallets
  WHERE user_id = $1 AND wallet_address = $2
)
`

type IsTrackingWalletParams struct {
	UserID        string `json:"userId"`
	WalletAddress string `binding:"required" example:"SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1" json:"walletAddress"`
}

func (q *Queries) IsTrackingWallet(ctx context.Context, arg IsTrackingWalletParams) (bool, error) {
	row := q.db.QueryRow(ctx, isTrackingWallet, arg.UserID, arg.WalletAddress)
	var exists bool
	err := row.Scan(&exists)
	return exists, err
}

const untrackWallet = `-- name: UntrackWallet :exec
DELETE FROM user_wallets
WHERE user_id = $1 AND wallet_address = $2
`

type UntrackWalletParams struct {
	UserID        string `json:"userId"`
	WalletAddress string `binding:"required" example:"SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1" json:"walletAddress"`
}

func (q *Queries) UntrackWallet(ctx context.Context, arg UntrackWalletParams) error {
	_, err := q.db.Exec(ctx, untrackWallet, arg.UserID, arg.WalletAddress)
	return err
}

const updateWalletPreferences = `-- name: UpdateWalletPreferences :one
UPDATE user_wallets
SET
    nickname = COALESCE($1, nickname),
    notifications = COALESCE($2, notifications),
    updated_at = now()
WHERE user_id = $3 AND wallet_address = $4
RETURNING user_id, wallet_address, nickname, emoji, notifications, created_at, updated_at
`

type UpdateWalletPreferencesParams struct {
	Nickname      string `binding:"required" example:"iatomic" json:"nickname"`
	Notifications bool   `json:"notifications"`
	ID            string `json:"id"`
	WalletAddress string `binding:"required" example:"SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1" json:"walletAddress"`
}

func (q *Queries) UpdateWalletPreferences(ctx context.Context, arg UpdateWalletPreferencesParams) (*UserWallet, error) {
	row := q.db.QueryRow(ctx, updateWalletPreferences,
		arg.Nickname,
		arg.Notifications,
		arg.ID,
		arg.WalletAddress,
	)
	var i UserWallet
	err := row.Scan(
		&i.UserID,
		&i.WalletAddress,
		&i.Nickname,
		&i.Emoji,
		&i.Notifications,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return &i, err
}

const upsertUserWallet = `-- name: UpsertUserWallet :one
INSERT INTO user_wallets (user_id, wallet_address, nickname, emoji)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id, wallet_address)
DO UPDATE SET
  nickname = EXCLUDED.nickname,
  emoji = EXCLUDED.emoji
RETURNING user_id, wallet_address, nickname, emoji, notifications, created_at, updated_at
`

type UpsertUserWalletParams struct {
	UserID        string  `json:"userId"`
	WalletAddress string  `binding:"required" example:"SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1" json:"walletAddress"`
	Nickname      string  `binding:"required" example:"iatomic" json:"nickname"`
	Emoji         *string `json:"emoji"`
}

func (q *Queries) UpsertUserWallet(ctx context.Context, arg UpsertUserWalletParams) (*UserWallet, error) {
	row := q.db.QueryRow(ctx, upsertUserWallet,
		arg.UserID,
		arg.WalletAddress,
		arg.Nickname,
		arg.Emoji,
	)
	var i UserWallet
	err := row.Scan(
		&i.UserID,
		&i.WalletAddress,
		&i.Nickname,
		&i.Emoji,
		&i.Notifications,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return &i, err
}

const walletExists = `-- name: WalletExists :one
SELECT EXISTS(SELECT 1 FROM wallets WHERE address = $1)
`

func (q *Queries) WalletExists(ctx context.Context, address string) (bool, error) {
	row := q.db.QueryRow(ctx, walletExists, address)
	var exists bool
	err := row.Scan(&exists)
	return exists, err
}
