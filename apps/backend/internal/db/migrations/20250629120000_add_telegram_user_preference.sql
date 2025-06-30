-- +goose Up
-- +goose StatementBegin
ALTER TABLE telegram_users
ADD COLUMN notification_preference TEXT NOT NULL DEFAULT 'confirmed';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE telegram_users
DROP COLUMN notification_preference;
-- +goose StatementEnd
