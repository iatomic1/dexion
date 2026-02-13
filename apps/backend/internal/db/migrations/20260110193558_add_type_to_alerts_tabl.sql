-- +goose Up
-- +goose StatementBegin
ALTER TABLE alerts
ADD COLUMN type VARCHAR(10) NOT NULL DEFAULT 'token'
CHECK (type IN ('token', 'hodlmm'));
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE alerts
DROP COLUMN type;
-- +goose StatementEnd
