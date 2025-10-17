-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS "alerts" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric TEXT NOT NULL CHECK (metric IN ('price', 'volume', 'tvl', 'marketcap')), -- tags:`binding:"required"`
  operator TEXT NOT NULL CHECK (operator IN ('>', '<', '>=', '<=', '=', '!=')), -- tags:`binding:"required"`
  value NUMERIC NOT NULL, -- tags:`binding:"required"`
  ca TEXT NOT NULL, -- tags:`binding:"required" example:"SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.velar-token"
  repeatable BOOLEAN NOT NULL DEFAULT false, -- tags:`binding:"required"`
  cooldown_seconds INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'triggered')), -- tags:`binding:"required"`
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS "alerts"
-- +goose StatementEnd
