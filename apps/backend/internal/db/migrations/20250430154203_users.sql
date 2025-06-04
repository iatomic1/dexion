-- +goose Up
-- +goose StatementBegin
DO $$ BEGIN
    CREATE TYPE user_type AS ENUM('APP', 'TELEGRAM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"email_verified" boolean NOT NULL,
	"image" text,
	"type" "user_type" NOT NULL,
	"telegram_chat_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_telegram_chat_id_unique" UNIQUE("telegram_chat_id"),
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "email_required_for_app" CHECK (("users"."type" = 'APP' AND "users"."email" IS NOT NULL) OR ("users"."type" = 'TELEGRAM' AND "users"."email" IS NULL))
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS "users";
DROP TYPE IF EXISTS user_type;
-- +goose StatementEnd
