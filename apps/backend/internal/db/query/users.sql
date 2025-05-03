
-- name: RegisterUser :one
INSERT INTO "users" (
 id, email, password, type
) VALUES ( uuid_generate_v4(), $1, $2, $3 )
RETURNING *
;

-- name: RegisterTelegramUser :one
INSERT INTO "users" (
  id, telegram_chat_id, password, type
) VALUES (
  uuid_generate_v4(), $1, $2, $3
)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM "users"
WHERE email = $1;

-- name: GetUserById :one
SELECT * FROM "users"
WHERE id = $1;
