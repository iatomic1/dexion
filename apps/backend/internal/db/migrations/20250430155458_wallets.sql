-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS wallets (
  address TEXT NOT NULL UNIQUE, -- tags:`binding:"required" example:"SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1"
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_wallets (
  user_id UUID REFERENCES users(id),
  wallet_address TEXT REFERENCES wallets(address) NOT NULL, -- tags:`binding:"required" example:"SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1"
  nickname TEXT NOT NULL, -- tags:`binding:"required" example:"iatomic"
  emoji TEXT,
  PRIMARY KEY (user_id, wallet_address)
);

CREATE INDEX idx_user_wallets_custom ON user_wallets(user_id, wallet_address);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS "wallets";
DROP TABLE IF EXISTS "user_wallets";
-- +goose StatementEnd
