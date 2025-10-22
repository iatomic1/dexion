-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS "webhook_configs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL, -- tags:`binding:"required"`
  bearer_token VARCHAR(512) NOT NULL, -- tags:`binding:"required"`
  enabled BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'streaming' CHECK (status IN ('streaming', 'interrupted')), -- tags:`binding:"required"`
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Available notification channels
CREATE TABLE IF NOT EXISTS "channels" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default channels
INSERT INTO channels (name, description) VALUES
  ('webapp', 'In-app toast notifications'),
  ('telegram', 'Telegram direct message'),
  ('email', 'Email notification'),
  ('webhook', 'Custom webhook endpoint')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "alerts" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric TEXT NOT NULL CHECK (metric IN ('price', 'volume', 'tvl', 'marketcap')), -- tags:`binding:"required"`
    operator TEXT NOT NULL CHECK (operator IN ('>', '<', '>=', '<=', '=', '!=')), -- tags:`binding:"required"`
    value TEXT NOT NULL CHECK (value ~ '^[0-9]+(\.[0-9]+)?$'), -- tags:`binding:"required"`
    ca TEXT NOT NULL, -- tags:`binding:"required" example:"SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.velar-token"`
    repeatable BOOLEAN NOT NULL DEFAULT false, -- tags:`binding:"required"`
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')), -- tags:`binding:"required"`
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alert-channel junction table (per-alert channel selection)
CREATE TABLE IF NOT EXISTS "alert_channels" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (alert_id, channel_id)
);


-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alert_channels_alert_id ON alert_channels(alert_id);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_user_id ON webhook_configs(user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_alert_channels_alert_id;
DROP INDEX IF EXISTS idx_alerts_user_id;
DROP INDEX IF EXISTS idx_alerts_status;
DROP INDEX IF EXISTS idx_webhook_configs_user_id;

DROP TABLE IF EXISTS alert_channels;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS channels;
DROP TABLE IF EXISTS webhook_configs;
-- +goose StatementEnd
