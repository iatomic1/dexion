-- name: CreateWatchlist :one
INSERT INTO watchlist (
   id, ca, user_id
) VALUES (
   uuid_generate_v4(), $1, $2
)
RETURNING *;

-- name: HasWatchlist :one
SELECT EXISTS (
  SELECT 1 FROM watchlist
  WHERE ca = $1 AND user_id = $2
) AS exists;

-- name: HasWatchlistById :one
SELECT EXISTS (
  SELECT 1 FROM watchlist
  WHERE id = $1 AND user_id = $2
) AS exists;

-- name: GetWatchlistsByUserId :many
SELECT * FROM watchlist
WHERE user_id = $1;

-- name: DeleteWatchlist :exec
DELETE FROM watchlist
WHERE id = $1 AND user_id = $2;
