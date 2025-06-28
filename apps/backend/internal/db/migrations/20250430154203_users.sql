-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"email_verified" boolean NOT NULL,
	"image" text,
	"invite_code" text,
	"sub_org_id" varchar(255),
	"wallet_id" varchar(255),
	"wallet_address" text,
	"wallet_public_key" text,
	"created_at" timestamp with time zone NOT NULL,
	"sub_org_created" boolean DEFAULT false,
	"updated_at" timestamp with time zone NOT NULL,
	"two_factor_enabled" boolean,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_invite_code_unique" UNIQUE("invite_code"),
	CONSTRAINT "users_sub_org_id_unique" UNIQUE("sub_org_id"),
	CONSTRAINT "users_wallet_id_unique" UNIQUE("wallet_id"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS "users";
-- +goose StatementEnd
