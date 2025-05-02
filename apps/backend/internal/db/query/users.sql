
-- name: RegisterUser :one
INSERT INTO "users" (
 id, email, password
) VALUES ( uuid_generate_v4(), $1, $2 )
RETURNING *
;

-- name: GetUserByEmail :one
SELECT * FROM "users"
WHERE email = $1;

-- name: GetUserById :one
SELECT * FROM "users"
WHERE id = $1;
