package http

import (
	"backend/config"
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	Router *gin.Engine
	Config *config.Config
	DB     *pgxpool.Pool
}

func NewServer(cfg *config.Config, db *pgxpool.Pool) (*Server, error) {
	return &Server{
		Config: cfg,
		DB:     db,
	}, nil
}

func RunServer(srv *Server) {
	if srv == nil {
		log.Fatal(errors.New("Server instance can't be nil"))
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = srv.Config.HttpAddress
	}
	fmt.Println(port)

	httpServer := &http.Server{
		// Addr: "0.0.0.0:" + port,
		Addr:         port,
		WriteTimeout: time.Second * 15,
		ReadTimeout:  time.Second * 15,
		IdleTimeout:  time.Second * 60,
		Handler:      srv.Router,
	}
	go func() {
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err, nil)
		}
	}()
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*15)
	defer cancel()
	if err := httpServer.Shutdown(ctx); err != nil {
		log.Fatal(err, nil)
	}
}
