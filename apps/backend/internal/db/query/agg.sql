-- name: GetAllWalletsAndWatchers :many
SELECT
    w.address,
    w.created_at,
    (
        SELECT jsonb_agg(json_build_object('user_id', uw.user_id, 'nickname', uw.nickname, 'preference', uw.notifications))
        FROM user_wallets uw
        WHERE uw.wallet_address = w.address
    ) AS app_watchers,
    (
        SELECT jsonb_agg(json_build_object('chat_id', tuw.chat_id, 'nickname', tuw.nickname, 'preference', tu.notification_preference))
        FROM telegram_user_wallets tuw
        JOIN telegram_users tu ON tuw.chat_id = tu.chat_id
        WHERE tuw.wallet_address = w.address
    ) AS telegram_watchers
FROM
    wallets w;