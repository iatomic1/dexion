package http

import (
	"backend/config"
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"
)

type Server struct {
	Router *gin.Engine
	Config *config.Config
	DB     *pgxpool.Pool
	RDB    *redis.Client
}

func NewServer(cfg *config.Config, db *pgxpool.Pool, rdb *redis.Client) (*Server, error) {
	return &Server{
		Config: cfg,
		DB:     db,
		RDB:    rdb,
	}, nil
}

func RunServer(srv *Server) {
	if srv == nil {
		log.Fatal().Err(errors.New("server instance can't be nil")).Msg("server instance is nil")
	}

	host := "0.0.0.0"
	port := os.Getenv("HTTP_SERVER_ADDRESS")
	// Check if on railway
	if os.Getenv("RAILWAY_ENVIRONMENT_NAME") != "" {
		host = ""
		port = os.Getenv("PORT")
	}

	if port == "" {
		port = "8080" // fallback default
	}

	httpServer := &http.Server{
		Addr:         host + ":" + port,
		WriteTimeout: time.Second * 15,
		ReadTimeout:  time.Second * 15,
		IdleTimeout:  time.Second * 60,
		Handler:      srv.Router,
	}

	log.Info().Str("addr", host+":"+port).Msg("HTTP server started")

	go func() {
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("listen and serve failed")
		}
	}()

	quit := make(chan os.Signal, 1)

	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*15)
	defer cancel()

	if err := httpServer.Shutdown(ctx); err != nil {
		log.Error().Err(err).Msg("Server shutdown failed")
	} else {
		log.Info().Msg("HTTP server stopped gracefully")
	}

	log.Info().Msg("Closing database connection...")
	srv.DB.Close()

	log.Info().Msg("Closing Redis connection...")
	if err := srv.RDB.Close(); err != nil {
		log.Error().Err(err).Msg("Redis connection closing failed")
	}

	log.Info().Msg("Server exited")

}
