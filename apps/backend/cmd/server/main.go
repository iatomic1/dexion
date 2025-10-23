//	@title			DEXION API
//	@version		1.0
//	@description	API for Dexion
//	@contact.name	Atomic
//	@contact.email	atomic.k.2739@gmail.com
//
//	@contact.url	https://github.com/iatomic1
//	@host			localhost:8080
//	@basePath		/api/v1
//	@schemes		http https

//	@securitydefinitions.apikey	AccessTokenBearer
//	@in							header
//	@name						Authorization
//	@description				AccessTokenBearer Authentication

//	@securitydefinitions.apikey	RefreshTokenBearer
//	@in							header
//	@name						Authorization
//	@description				RefreshTokenBearer Authentication

// @securityDefinitions.oauth2.accessCode Google OAuth2
// @tokenUrl https://oauth2.googleapis.com/token
// @authorizationUrl https://accounts.google.com/o/oauth2/auth
// @scope.profile Grants access to user's basic profile info
// @scope.email Grants access to user's email

// @tag.name			Auth
// @tag.description	Authentication endpoints
package main

import (
	"backend/api/http"
	"backend/api/http/router"
	"backend/config"
	"backend/pkg/projectpath"
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func main() {
	cfg, err := config.Load(projectpath.Root)
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	// Get database URL from environment or config
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		dbURL = cfg.DbURL
	}

	// Create a connection pool instead of a single connection
	poolConfig, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		log.Fatalf("Unable to parse pool config: %v\n", err)
	}

	poolConfig.MaxConns = 10

	// Create the connection pool
	pool, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
	}
	defer pool.Close()

	// Verify connection is working
	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	fmt.Println("Database connection pool established successfully")

	rdbURL := os.Getenv("REDIS_URL")
	if rdbURL == "" {
		rdbURL = cfg.RdbURL
	}

	opt, err := redis.ParseURL(rdbURL)
	if err != nil {
		log.Fatalf("Invalid Redis URL: %v", err)
	}

	rdb := redis.NewClient(opt)

	err = rdb.Ping(context.Background()).Err()
	if err != nil {
		log.Fatalf("Could not connect to Redis: %v", err)
	}
	fmt.Println("Connected to Redis successfully")
	srv, err := http.NewServer(cfg, pool, rdb)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Server initialized successfully")
	router.SetupRouter(srv)
	http.RunServer(srv)
}
