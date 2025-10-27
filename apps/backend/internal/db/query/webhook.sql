-- name: CreateWebhookConfig :one
INSERT INTO webhook_config (
    user_id, webhook_url, bearer_token, enabled, status
) VALUES (
    $1, $2, $3, true, 'streaming'
)
RETURNING *;

-- name: GetWebhookConfigByUserID :one
SELECT * FROM webhook_config
WHERE user_id = $1;

-- name: UpdateWebhookConfig :one
UPDATE webhook_config
SET
    webhook_url = COALESCE(sqlc.arg('webhook_url'), webhook_url),
    bearer_token = COALESCE(sqlc.arg('bearer_token'), bearer_token),
    enabled = COALESCE(sqlc.arg('enabled'), enabled),
    status = COALESCE(sqlc.arg('status'), status),
    updated_at = now()
WHERE user_id = sqlc.arg('user_id')
RETURNING *;

-- name: DeleteWebhookConfig :exec
DELETE FROM webhook_config
WHERE user_id = $1;
