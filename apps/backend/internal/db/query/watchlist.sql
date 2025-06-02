-- name: CreateWatchlist :one
INSERT INTO watchlists (
    ca, user_id
) VALUES (
    $1, $2
)
RETURNING *;

-- name: GetWatchlistById :one
SELECT * FROM watchlists
WHERE id = $1;

-- name: GetWatchlistsByUserId :many
SELECT * FROM watchlists
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: GetWatchlistByUserIdAndCA :one
SELECT * FROM watchlists
WHERE user_id = $1 AND ca = $2;

-- name: UpdateWatchlist :one
UPDATE watchlists
SET ca = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteWatchlist :exec
DELETE FROM watchlists
WHERE id = $1;

-- name: DeleteWatchlistsByUserId :exec
DELETE FROM watchlists
WHERE user_id = $1;
