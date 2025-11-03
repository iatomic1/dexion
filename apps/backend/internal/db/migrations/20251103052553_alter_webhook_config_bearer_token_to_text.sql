-- +goose Up
-- +goose StatementBegin
ALTER TABLE webhook_config
ALTER COLUMN bearer_token TYPE TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE webhook_config
ALTER COLUMN bearer_token TYPE VARCHAR(512);
-- +goose StatementEnd
