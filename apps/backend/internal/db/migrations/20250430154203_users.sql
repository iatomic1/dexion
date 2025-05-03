-- +goose Up
-- +goose StatementBegin
CREATE TYPE user_type AS ENUM ('APP', 'TELEGRAM');
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT, -- tags:`binding:"required,email" example:"mosh@mail.com"
    type user_type NOT NULL, -- tags:`binding:"required" example:"APP"
    telegram_chat_id TEXT UNIQUE,
    password VARCHAR(255) NOT NULL,    -- tags:binding:"required" example:"Hello"
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT email_required_for_app CHECK (
      (type = 'APP' AND email IS NOT NULL) OR
      (type = 'TELEGRAM' AND email IS NULL)
    ),
    CONSTRAINT user_email_unique UNIQUE (email)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS "users";
DROP TYPE IF EXISTS user_type;
-- +goose StatementEnd
