include .env

MIGRATIONS_DIR=internal/db/migrations

migrate:
	@if [ -z "$(DB_URL)" ]; then \
		echo "DB_URL not set in .env"; \
		exit 1; \
	fi
	goose -dir $(MIGRATIONS_DIR) postgres "$(DB_URL)" up

new-migration:
	@if [ -z "$(DB_URL)" ]; then \
		echo "DB_URL not set in .env"; \
		exit 1; \
	fi
	@if [ -z "$(name)" ]; then \
		echo "Usage: make new-migration name=add_users_table"; \
		exit 1; \
	fi
	@if echo "$(name)" | grep -q '[^a-zA-Z0-9_]'; then \
		echo "Migration name can only contain letters, numbers, and underscores"; \
		exit 1; \
	fi
	goose -dir $(MIGRATIONS_DIR) create "$(name)" sql
