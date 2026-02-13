-- +goose Up
-- +goose StatementBegin

-- Create HODLMM alerts table
CREATE TABLE IF NOT EXISTS "hodlmm_alerts" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Position identification
  stacks_address TEXT NOT NULL, -- The user's Stacks address for fetching positions
  pool_id VARCHAR(50) NOT NULL,
  pool_contract VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  token_x_symbol VARCHAR(20),
  token_y_symbol VARCHAR(20),

  -- Notification channels (store as boolean flags)
  notify_via_webapp BOOLEAN NOT NULL DEFAULT false,
  notify_via_telegram BOOLEAN NOT NULL DEFAULT false,
  notify_via_email BOOLEAN NOT NULL DEFAULT false,
  notify_via_webhook BOOLEAN NOT NULL DEFAULT false,

  -- Notification preferences
  notify_on_out_of_range BOOLEAN NOT NULL DEFAULT true,
  notify_on_back_in_range BOOLEAN NOT NULL DEFAULT true,

  -- State tracking
  last_known_status VARCHAR(20) NOT NULL CHECK (last_known_status IN ('in-range', 'out-of-range')),
  last_known_value_usd DECIMAL(20, 2),
  last_checked TIMESTAMPTZ,
  last_notified TIMESTAMPTZ,

  -- Alert status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_hodlmm_alerts_user_id ON hodlmm_alerts(user_id);
CREATE INDEX idx_hodlmm_alerts_stacks_address ON hodlmm_alerts(stacks_address);
CREATE INDEX idx_hodlmm_alerts_pool_id ON hodlmm_alerts(pool_id);
CREATE INDEX idx_hodlmm_alerts_status ON hodlmm_alerts(status);
CREATE INDEX idx_hodlmm_alerts_active ON hodlmm_alerts(status, last_checked) WHERE status = 'active';

-- Alert-channel junction table for HODLMM alerts
CREATE TABLE IF NOT EXISTS "hodlmm_alert_channels" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES hodlmm_alerts(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (alert_id, channel_id)
);

CREATE INDEX idx_hodlmm_alert_channels_alert_id ON hodlmm_alert_channels(alert_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP INDEX IF EXISTS idx_hodlmm_alert_channels_alert_id;
DROP TABLE IF EXISTS hodlmm_alert_channels;

DROP INDEX IF EXISTS idx_hodlmm_alerts_active;
DROP INDEX IF EXISTS idx_hodlmm_alerts_status;
DROP INDEX IF EXISTS idx_hodlmm_alerts_pool_id;
DROP INDEX IF EXISTS idx_hodlmm_alerts_stacks_address;
DROP INDEX IF EXISTS idx_hodlmm_alerts_user_id;
DROP TABLE IF EXISTS hodlmm_alerts;

-- +goose StatementEnd
