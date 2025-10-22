-- name: CreateAlert :one
INSERT INTO alerts (
    user_id, metric, operator, value, ca, repeatable, status
) VALUES (
    $1, $2, $3, $4, $5, $6, 'active'
)
RETURNING *;

-- name: CreateAlertChannel :exec
INSERT INTO alert_channels (alert_id, channel_id)
VALUES ($1, $2)
ON CONFLICT (alert_id, channel_id) DO NOTHING;

-- name: CreateAlertChannels :exec
INSERT INTO alert_channels (alert_id, channel_id)
SELECT $1, UNNEST($2::uuid[])
ON CONFLICT (alert_id, channel_id) DO NOTHING;

-- name: DeleteAlertChannels :exec
DELETE FROM alert_channels WHERE alert_id = $1;

-- name: InsertAlertChannels :many
INSERT INTO alert_channels (alert_id, channel_id)
SELECT $1, UNNEST($2::uuid[])
RETURNING channel_id;

-- name: ReplaceAlertChannels :one
WITH deleted AS (
  DELETE FROM alert_channels
  WHERE alert_id = $1
),
inserted AS (
  INSERT INTO alert_channels (alert_id, channel_id)
  SELECT $1, UNNEST($2::uuid[])
  RETURNING channel_id
)
SELECT COALESCE(
  json_agg(json_build_object('id', i.channel_id)) FILTER (WHERE i.channel_id IS NOT NULL),
  '[]'
) AS channels
FROM inserted i;

-- name: UpdateAlertWithChannels :one
WITH updated AS (
  UPDATE alerts
  SET
    metric     = COALESCE(sqlc.arg('metric'), metric),
    operator   = COALESCE(sqlc.arg('operator'), operator),
    value      = COALESCE(sqlc.arg('value'), value),
    repeatable = COALESCE(sqlc.arg('repeatable'), repeatable),
    updated_at = now()
  WHERE id = sqlc.arg('alert_id')
    AND user_id = sqlc.arg('user_id')
  RETURNING id, user_id, metric, operator, value, repeatable, status, ca, created_at, updated_at
),
deleted AS (
  DELETE FROM alert_channels
  WHERE alert_id IN (SELECT id FROM updated)
),
inserted AS (
  INSERT INTO alert_channels (alert_id, channel_id)
  SELECT u.id, UNNEST(sqlc.arg('channel_ids')::uuid[])
  FROM updated u
  ON CONFLICT DO NOTHING
  RETURNING 1
)
SELECT
  u.id,
  u.user_id,
  u.metric,
  u.operator,
  u.value,
  u.repeatable,
  u.status,
  u.ca,
  u.created_at,
  u.updated_at,
  COALESCE(
    json_agg(json_build_object('id', ac.channel_id))
    FILTER (WHERE ac.channel_id IS NOT NULL),
    '[]'
  ) AS channels
FROM updated u
LEFT JOIN alert_channels ac ON ac.alert_id = u.id
-- 👇 force dependency on inserted
JOIN inserted i ON TRUE
GROUP BY
  u.id,
  u.user_id,
  u.metric,
  u.operator,
  u.value,
  u.repeatable,
  u.status,
  u.ca,
  u.created_at,
  u.updated_at;

-- name: GetAlertById :one
SELECT * FROM alerts
WHERE id = $1 AND user_id = $2;

-- name: GetUserAlerts :many
-- returns: id:uuid, user_id:string, metric:string, operator:string, value:string, ca:string, repeatable:bool, status:string, updated_at:timestamp, created_at:timestamp, channels:[]Channel
SELECT
    a.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', c.id,
                'name', c.name,
                'description', c.description
            )
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'
    ) AS channels
FROM alerts a
LEFT JOIN alert_channels ac ON a.id = ac.alert_id
LEFT JOIN channels c ON ac.channel_id = c.id
WHERE a.user_id = $1
GROUP BY a.id
ORDER BY a.created_at DESC;

-- name: UpdateAlert :one
UPDATE alerts
SET
    metric     = COALESCE(sqlc.arg('metric'), metric),
    operator   = COALESCE(sqlc.arg('operator'), operator),
    value      = COALESCE(sqlc.arg('value'), value),
    repeatable = COALESCE(sqlc.arg('repeatable'), repeatable),
    updated_at = now()
WHERE id = sqlc.arg('id') AND user_id = sqlc.arg('user_id')
RETURNING *;

-- name: DeleteAlert :one
DELETE FROM alerts
WHERE id = $1 AND user_id = $2
RETURNING *;


-- name: DeleteAllInactiveAlerts :exec
DELETE FROM alerts
WHERE user_id = $1
  AND status != 'active';

-- name: HasAlert :one
SELECT EXISTS (
    SELECT 1 FROM alerts
    WHERE id = $1 AND user_id = $2
);

-- name: GetActiveAlertsByMetric :many
SELECT * FROM alerts
WHERE metric = $1 AND status = 'active';

-- name: GetAllChannels :many
SELECT id, name, description, created_at
FROM channels
ORDER BY name;
