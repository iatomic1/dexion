ALTER TABLE "users" ADD COLUMN "external_address" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "external_address_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_external_address_unique" UNIQUE("external_address");