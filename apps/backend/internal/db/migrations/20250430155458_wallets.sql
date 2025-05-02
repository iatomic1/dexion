-- +goose Up
-- +goose StatementBegin
CREATE TABLE wallets (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT,
    chat_id TEXT,
    wallet_address TEXT NOT NULL UNIQUE -- tags:`binding:"required" example:"SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1"
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS "wallets";
-- +goose StatementEnd
