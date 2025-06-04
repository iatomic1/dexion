// watchlist/watchlist_app.go
package watchlist

import (
	"backend/api/http"
	"backend/internal/db/repository"
	"backend/internal/domain"
	"context"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/golodash/galidator/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type WatchlistHandler struct {
	srv *http.Server
}

func NewWatchlistHandler(srv *http.Server) *WatchlistHandler {
	return &WatchlistHandler{srv: srv}
}

// Helper function to acquire a connection from the pool and create a transaction
func (h *WatchlistHandler) beginTx(ctx context.Context) (repository.DBTX, func(), error) {
	// Get a connection from the pool
	conn, err := h.srv.DB.Acquire(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to acquire connection: %w", err)
	}

	// Create cleanup function that will be called in defer
	cleanup := func() {
		conn.Release()
	}

	// Begin transaction
	tx, err := conn.Begin(ctx)
	if err != nil {
		cleanup()
		return nil, nil, fmt.Errorf("failed to begin transaction: %w", err)
	}

	// Return transaction and cleanup function
	return tx, func() {
		tx.Rollback(ctx)
		cleanup()
	}, nil
}

// CreateWatchlist godoc
//
// @Summary        Create a new watchlist entry
// @Description    Add a contract address to user's watchlist
// @Tags           Watchlist
// @Security       ApiKeyAuth
// @Accept         json
// @Produce        json
// @Param          WatchlistRequest    body        repository.CreateWatchlistParams    true    "Watchlist data"
// @Success        201                 {object}    http.Response{data=repository.Watchlist}    "Watchlist created successfully"
// @Failure        400                 {object}    map[string]string                            "Invalid request data"
// @Failure        409                 {object}    map[string]string                            "Contract already in watchlist"
// @Failure        500                 {object}    http.InternalServerErrorResponse            "Internal server error"
// @Router         /watchlist [post]
func (h *WatchlistHandler) CreateWatchlist(c *gin.Context) {
	g := galidator.New().CustomMessages(galidator.Messages{
		"required": "$field is required",
	})
	customizer := g.Validator(repository.CreateWatchlistParams{})

	var req repository.CreateWatchlistParams
	if err := c.ShouldBindJSON(&req); err != nil {
		http.SendValidationError(c, customizer.DecryptErrors(err))
		return
	}

	userID, err := domain.GetUserIDFromContext(c)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("error getting userID"))
		return
	}
	req.UserID = &userID
	ctx := context.Background()

	// First check if user already has this contract in their watchlist
	repo := repository.New(h.srv.DB)
	exists, err := repo.HasWatchlist(ctx, repository.HasWatchlistParams{
		UserID: &userID,
		Ca:     req.Ca,
	})
	if exists {
		// If no error, it means the record exists
		http.SendConflict(c, fmt.Errorf("contract already in watchlist"), http.WithMessage("Contract already in watchlist"))
		return
	}

	// For write operations, use our helper to get a transaction
	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		fmt.Println("")
		http.SendInternalServerError(c, err)
		return
	}
	defer cleanup()

	txRepo := repository.New(tx)

	watchlist, err := txRepo.CreateWatchlist(ctx, req)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == domain.UniqueViolation {
			http.SendConflict(c, err, http.WithMessage("Contract already in watchlist"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	// Commit the transaction
	if txObj, ok := tx.(interface{ Commit(context.Context) error }); ok {
		if err := txObj.Commit(ctx); err != nil {
			http.SendInternalServerError(c, err)
			return
		}
	} else {
		http.SendInternalServerError(c, fmt.Errorf("transaction doesn't support commit"))
		return
	}

	http.SendCreated(c, watchlist, http.WithMessage("Contract added to watchlist successfully"))
}

// GetUserWatchlists godoc
//
// @Summary        Get user's watchlist
// @Description    Retrieve all watchlist entries for the authenticated user
// @Tags           Watchlist
// @Security       ApiKeyAuth
// @Produce        json
// @Success        200    {object}    http.Response{data=[]repository.Watchlist}    "User watchlist retrieved"
// @Failure        500    {object}    http.InternalServerErrorResponse              "Internal server error"
// @Router         /watchlist [get]
func (h *WatchlistHandler) GetUserWatchlists(c *gin.Context) {
	userID, err := domain.GetUserIDFromContext(c)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("error getting userID"))
		return
	}
	ctx := context.Background()

	// For read-only operations, we can use the DB pool directly
	repo := repository.New(h.srv.DB)
	watchlists, err := repo.GetWatchlistsByUserId(ctx, &userID)
	if err != nil {
		fmt.Printf("Error getting watchlists: %v\n", err) // Log the exact error
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			fmt.Printf("PostgreSQL Error: %+v\n", pgErr) // Log PostgreSQL details
		}
		http.SendInternalServerError(c, err)
		return
	}

	http.SendSuccess(c, watchlists, http.WithMessage("User watchlist retrieved successfully"))
}

// DeleteWatchlist godoc
//
// @Summary        Delete watchlist entry
// @Description    Delete a specific watchlist entry by ID
// @Tags           Watchlist
// @Security       ApiKeyAuth
// @Param          id    path        string    true    "Watchlist ID (UUID)"
// @Success        200   {object}    http.Response    "Watchlist entry deleted successfully"
// @Failure        400   {object}    map[string]string                        "Invalid ID"
// @Failure        404   {object}    map[string]string                        "Watchlist entry not found"
// @Failure        500   {object}    http.InternalServerErrorResponse        "Internal server error"
// @Router         /watchlist/{id} [delete]
func (h *WatchlistHandler) DeleteWatchlist(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.SendBadRequest(c, fmt.Errorf("invalid UUID format"), http.WithMessage("Invalid UUID format"))
		return
	}

	userID, err := domain.GetUserIDFromContext(c)
	if err != nil {
		http.SendInternalServerError(c, err, http.WithMessage("error getting userID"))
		return
	}

	ctx := context.Background()

	// For write operations, use our helper to get a transaction
	tx, cleanup, err := h.beginTx(ctx)
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}
	defer cleanup()

	txRepo := repository.New(tx)

	// First check if the watchlist entry exists
	exists, err := txRepo.HasWatchlistById(ctx, repository.HasWatchlistByIdParams{
		ID:     id,
		UserID: &userID,
	})
	if !exists {
		if errors.Is(err, pgx.ErrNoRows) {
			http.SendNotFound(c, err, http.WithMessage("Watchlist entry not found"))
			return
		}
		http.SendInternalServerError(c, err)
		return
	}

	err = txRepo.DeleteWatchlist(ctx, repository.DeleteWatchlistParams{ID: id, UserID: &userID})
	if err != nil {
		http.SendInternalServerError(c, err)
		return
	}

	// Commit the transaction
	if txObj, ok := tx.(interface{ Commit(context.Context) error }); ok {
		if err := txObj.Commit(ctx); err != nil {
			http.SendInternalServerError(c, err)
			return
		}
	} else {
		http.SendInternalServerError(c, fmt.Errorf("transaction doesn't support commit"))
		return
	}

	http.SendSuccess(c, nil, http.WithMessage("Watchlist entry deleted successfully"))
}
