CREATE TABLE "wallet_address" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"address" text NOT NULL,
	"network" text NOT NULL,
	"is_primary" boolean,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wallet_address" ADD CONSTRAINT "wallet_address_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;