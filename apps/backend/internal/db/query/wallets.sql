-- name: CreateWallet :one
WITH ins AS (
  INSERT INTO wallets (address)
  VALUES ($1)
  ON CONFLICT (address) DO NOTHING
  RETURNING *
)
SELECT * FROM ins
UNION ALL
SELECT * FROM wallets WHERE address = $1;

-- name: UpsertUserWallet :one
INSERT INTO user_wallets (user_id, wallet_address, nickname, emoji)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id, wallet_address)
DO UPDATE SET
  nickname = EXCLUDED.nickname,
  emoji = EXCLUDED.emoji
RETURNING *;

-- name: GetUserTrackedWallets :many
SELECT w.address, uw.nickname, uw.emoji, uw.notifications, w.created_at
FROM user_wallets uw
JOIN wallets w ON uw.wallet_address = w.address
WHERE uw.user_id = $1;

-- name: GetAllWallets :many
SELECT * FROM wallets;

-- name: IsTrackingWallet :one
SELECT EXISTS(
  SELECT 1 FROM user_wallets
  WHERE user_id = $1 AND wallet_address = $2
);

-- name: UpdateWalletPreferences :one
UPDATE user_wallets
SET
    nickname = COALESCE(sqlc.arg('nickname'), nickname),
    notifications = COALESCE(sqlc.arg('notifications'), notifications),
    updated_at = now()
WHERE user_id = sqlc.arg('id') AND wallet_address = sqlc.arg('wallet_address')
RETURNING *;

-- name: UntrackWallet :exec
DELETE FROM user_wallets
WHERE user_id = $1 AND wallet_address = $2;

-- name: CleanupOrphanedWallet :exec
DELETE FROM wallets
WHERE address = $1
AND NOT EXISTS (
  SELECT 1 FROM user_wallets
  WHERE wallet_address = $1
);

-- name: GetWatchersForWallet :many
SELECT user_id, nickname, emoji, notifications
FROM user_wallets
WHERE wallet_address = $1;

-- name: WalletExists :one
SELECT EXISTS(SELECT 1 FROM wallets WHERE address = $1);

-- name: GetUserWalletDetails :one
SELECT nickname, emoji, notifications
FROM user_wallets
WHERE user_id = $1 AND wallet_address = $2;
