INSERT INTO telegram_users (chat_id, username)
-- name: CreateTelegramUser :one
VALUES ($1, $2)
ON CONFLICT (chat_id) DO UPDATE SET
  username = EXCLUDED.username
RETURNING *;

-- name: GetTelegramUser :one
SELECT * FROM telegram_users
WHERE chat_id = $1;

-- name: TrackWalletTelegram :one
INSERT INTO telegram_user_wallets (chat_id, wallet_address, nickname)
VALUES ($1, $2, $3)
RETURNING *;

-- name: UntrackWalletTelegram :exec
DELETE FROM telegram_user_wallets
WHERE chat_id = $1 AND wallet_address = $2;

-- name: UpdateTelegramUserPreference :one
UPDATE telegram_users
SET notification_preference = $2
WHERE chat_id = $1
RETURNING *;

-- name: GetTrackedWalletsTelegram :many
SELECT w.address, tuw.nickname, w.created_at
FROM telegram_user_wallets tuw
JOIN wallets w ON tuw.wallet_address = w.address
WHERE tuw.chat_id = $1;

-- name: IsTrackingWalletTelegram :one
SELECT EXISTS(
  SELECT 1 FROM telegram_user_wallets
  WHERE chat_id = $1 AND wallet_address = $2
);

-- name: UpsertTelegramUserWallet :one
WITH wallet AS (
  INSERT INTO wallets (address)
  VALUES ($2)
  ON CONFLICT (address) DO NOTHING
  RETURNING address
)
INSERT INTO telegram_user_wallets (chat_id, wallet_address, nickname)
VALUES ($1, $2, $3)
ON CONFLICT (chat_id, wallet_address)
DO UPDATE SET
  nickname = EXCLUDED.nickname
RETURNING *;
