-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS "webhook_config" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  webhook_url TEXT NOT NULL, -- tags:`binding:"required"`
  bearer_token VARCHAR(512) NOT NULL, -- tags:`binding:"required"`
  enabled BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'streaming' CHECK (status IN ('streaming', 'interrupted')), -- tags:`binding:"required"`
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_config_user_id ON webhook_config(user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_webhook_config_user_id;
DROP TABLE IF EXISTS webhook_config;
-- +goose StatementEnd