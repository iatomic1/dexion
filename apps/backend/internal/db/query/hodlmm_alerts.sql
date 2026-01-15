-- name: CreateHodlmmAlerts :many
INSERT INTO hodlmm_alerts (
  user_id,
  stacks_address,
  pool_id,
  pool_contract,
  display_name,
  token_x_symbol,
  token_y_symbol,
  notify_via_webapp,
  notify_via_telegram,
  notify_via_email,
  notify_via_webhook,
  notify_on_out_of_range,
  notify_on_back_in_range,
  last_known_status,
  status
)
SELECT
  $1,
  unnest(@stacks_addresses::text[]),
  unnest(@pool_ids::text[]),
  unnest(@pool_contracts::text[]),
  unnest(@display_names::text[]),
  unnest(@token_x_symbols::text[]),
  unnest(@token_y_symbols::text[]),
  unnest(@notify_via_webapp_flags::boolean[]),
  unnest(@notify_via_telegram_flags::boolean[]),
  unnest(@notify_via_email_flags::boolean[]),
  unnest(@notify_via_webhook_flags::boolean[]),
  unnest(@notify_on_out_of_range_flags::boolean[]),
  unnest(@notify_on_back_in_range_flags::boolean[]),
  unnest(@initial_statuses::text[]),
  'active'
RETURNING *;

-- name: UpdateHodlmmAlert :one
UPDATE hodlmm_alerts
SET
  notify_via_webapp = COALESCE(sqlc.narg('notify_via_webapp'), notify_via_webapp),
  notify_via_telegram = COALESCE(sqlc.narg('notify_via_telegram'), notify_via_telegram),
  notify_via_email = COALESCE(sqlc.narg('notify_via_email'), notify_via_email),
  notify_via_webhook = COALESCE(sqlc.narg('notify_via_webhook'), notify_via_webhook),
  notify_on_out_of_range = COALESCE(sqlc.narg('notify_on_out_of_range'), notify_on_out_of_range),
  notify_on_back_in_range = COALESCE(sqlc.narg('notify_on_back_in_range'), notify_on_back_in_range),
  status = COALESCE(sqlc.narg('status'), status),
  updated_at = NOW()
WHERE id = sqlc.arg('id') AND user_id = sqlc.arg('user_id')
RETURNING *;

-- name: PauseAllHodlmmAlerts :exec
UPDATE hodlmm_alerts
SET status = 'paused', updated_at = NOW()
WHERE user_id = $1 AND status = 'active';

-- name: UpdateHodlmmAlertStatus :one
UPDATE hodlmm_alerts
SET
  last_known_status = $2,
  last_known_value_usd = $3,
  last_checked = NOW(),
  updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: GetHodlmmAlerts :many
SELECT * FROM hodlmm_alerts
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: GetHodlmmAlertByID :one
SELECT * FROM hodlmm_alerts
WHERE id = $1 AND user_id = $2;

-- name: DeleteHodlmmAlert :exec
DELETE FROM hodlmm_alerts
WHERE id = $1 AND user_id = $2;
