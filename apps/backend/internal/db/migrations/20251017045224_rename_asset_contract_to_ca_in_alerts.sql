-- +goose Up
-- +goose StatementBegin
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='alerts' AND column_name='asset_contract'
    ) THEN
        ALTER TABLE alerts RENAME COLUMN asset_contract TO ca;
    END IF;
END;
$$;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='alerts' AND column_name='ca'
    ) THEN
        ALTER TABLE alerts RENAME COLUMN ca TO asset_contract;
    END IF;
END;
$$;
-- +goose StatementEnd
