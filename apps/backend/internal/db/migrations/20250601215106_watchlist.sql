-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ca VARCHAR(255) NOT NULL, -- tags:`binding:"required" example:"SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.velar-token"
    user_id TEXT REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS watchlist;
-- +goose StatementEnd
