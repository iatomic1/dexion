MIGRATIONS_DIR = internal/db/migrations
GO = go
DOCS_DIR = internal/docs
SWAGGER_ENTRY = cmd/server/main.go
SWAGGER_FLAGS = --parseDepth 1 --parseDependency --parseInternal --o $(DOCS_DIR)
DB_CONTAINER ?= dexion
DB_PASSWORD ?= postgres
DB_PORT ?= 5432

.PHONY: restart clean migrate new-migration docs dev stop-container remove-container start-container restart-db psql gen convert-docs add-prefix

# ------------------------
# Database Migrations
# ------------------------
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

# ------------------------
# Cleaning
# ------------------------
clean:
	rm -rf ./tmp
	rm -rf ./internal/docs/

# ------------------------
# Docs
# ------------------------
convert-docs:
	swagger2openapi $(DOCS_DIR)/swagger.json > $(DOCS_DIR)/openapi.json

add-prefix:
	python3 ./scripts/add_prefix.py

docs:
	swag init -g $(SWAGGER_ENTRY) $(SWAGGER_FLAGS)
	@sleep 1
	$(MAKE) convert-docs
	# $(MAKE) add-prefix

# ------------------------
# Docker / PostgreSQL
# ------------------------
stop-container:
	@echo "Stopping existing container..."
	docker stop $(DB_CONTAINER) || true

remove-container:
	@echo "Removing container..."
	docker rm $(DB_CONTAINER) || true

start-container:
	@echo "Starting new container..."
	docker run --name $(DB_CONTAINER) \
		-e POSTGRES_PASSWORD=$(DB_PASSWORD) \
		-p $(DB_PORT):5432 \
		-d postgres

restart-db:
	$(MAKE) stop-container
	$(MAKE) remove-container
	$(MAKE) start-container
	@echo "Waiting for PostgreSQL to start..."
	@sleep 3
	@docker exec -it $(DB_CONTAINER) psql -U postgres -c 'CREATE DATABASE "dexion";'
	@echo "Enabling UUID extension..."
	@docker exec -i $(DB_CONTAINER) psql -U postgres -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'

psql:
	@docker exec -it $(DB_CONTAINER) psql -U postgres

# ------------------------
# Code generation
# ------------------------
gen:
	# @python3 ./scripts/add_tags.py
	@sqlc generate

# ------------------------
# Development
# ------------------------
dev:
	$(MAKE) clean
	# docker start $(DB_CONTAINER)
	# $(MAKE) migrate
	# $(MAKE) gen
	$(MAKE) docs
	air
