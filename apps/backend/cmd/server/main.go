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

	"github.com/jackc/pgx/v5"
)

func main() {
	cfg, err := config.Load(projectpath.Root)
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	conn, err := pgx.Connect(context.Background(), cfg.DbURL)
	if err != nil {
		log.Fatalf("Unable to connect to db: %v\n", err)
	}
	defer conn.Close(context.Background())

	srv, err := http.NewServer(cfg, conn)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("It is done")
	router.SetupRouter(srv)
	http.RunServer(srv)
}
