-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS telegram_users (
    chat_id TEXT PRIMARY KEY, -- Telegram's unique chat ID is the perfect primary key
    username TEXT, -- Telegram username, can be null
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS telegram_user_wallets (
    chat_id TEXT REFERENCES telegram_users(chat_id) ON DELETE CASCADE,
    wallet_address TEXT REFERENCES wallets(address) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (chat_id, wallet_address)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS telegram_user_wallets;
DROP TABLE IF EXISTS telegram_users;
-- +goose StatementEnd
