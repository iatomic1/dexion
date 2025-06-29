-- name: GetAllWalletsAndWatchers :many
SELECT
    w.address,
    w.created_at,
    (
        SELECT jsonb_agg(uw.user_id)
        FROM user_wallets uw
        WHERE uw.wallet_address = w.address
    ) AS app_watchers,
    (
        SELECT jsonb_agg(tuw.chat_id)
        FROM telegram_user_wallets tuw
        WHERE tuw.wallet_address = w.address
    ) AS telegram_watchers
FROM
    wallets w;