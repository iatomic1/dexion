-- name: AddRefreshTokenID :one
INSERT INTO "refresh_tokens" (
 id, user_id, expires_at
) VALUES ( $1, $2, $3 )
RETURNING *
;

-- name: DeleteRefreshToken :exec
DELETE FROM "refresh_tokens"
  WHERE id = $1
;

-- name: RefreshTokenExists :one
SELECT EXISTS (
  SELECT 1 FROM "refresh_tokens" WHERE id = $1
);

-- name: GetRefreshTokenUserID :one
SELECT user_id FROM refresh_tokens
WHERE id = $1 AND revoked = FALSE
LIMIT 1;
