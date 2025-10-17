-- name: CreateAlert :one
INSERT INTO alerts (
    id, user_id, metric, operator, value, ca, repeatable, cooldown_seconds, status
) VALUES (
    gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING *;

-- name: GetAlertById :one
SELECT * FROM alerts
WHERE id = $1 AND user_id = $2;

-- name: GetAlertsByUserId :many
SELECT * FROM alerts
WHERE user_id = $1;

-- name: UpdateAlert :one
UPDATE alerts
SET metric = $3,
    operator = $4,
    value = $5,
    ca = $6,
    repeatable = $7,
    cooldown_seconds = $8,
    status = $9,
    updated_at = NOW()
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: DeleteAlert :exec
DELETE FROM alerts
WHERE id = $1 AND user_id = $2;

-- name: HasAlert :one
SELECT EXISTS (
    SELECT 1 FROM alerts
    WHERE id = $1 AND user_id = $2
);

-- name: GetActiveAlertsByMetric :many
SELECT * FROM alerts
WHERE metric = $1 AND status = 'active';

-- name: PauseAlert :one
UPDATE alerts
SET status = 'paused', updated_at = NOW()
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: ActivateAlert :one
UPDATE alerts
SET status = 'active', updated_at = NOW()
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: TriggerAlert :one
UPDATE alerts
SET status = 'triggered', updated_at = NOW()
WHERE id = $1 AND user_id = $2
RETURNING *;
