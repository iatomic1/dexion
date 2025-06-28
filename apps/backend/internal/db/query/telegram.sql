-- name: CreateTelegramUser :one
INSERT INTO telegram_users (chat_id, first_name, username)
VALUES ($1, $2, $3)
ON CONFLICT (chat_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
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
