package router

import (
	"backend/pkg/projectpath"
	"net/http"
	"path/filepath"

	scalargo "github.com/bdpiprava/scalar-go"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

func RegisterDocsRoutes(router *gin.RouterGroup) {
	docsGroup := router
	specUrl := filepath.Join(projectpath.Root, "/internal/docs/openapi.json")

	log.Info().Str("specUrl", specUrl).Msg("Serving spec from")
	docsGroup.GET("/test", func(c *gin.Context) {
		c.String(http.StatusOK, "Docs group is working")
	})
	// spec2Url := filepath.Join(projectpath.Root, "/oas.json")

	log.Info().Msg("routing")
	docsGroup.GET("/reference", func(c *gin.Context) {
		log.Info().Msg("httping")
		content, err := scalargo.NewV2(
			scalargo.WithSpecURL("/api/v1/docs/swagger.json"),
			scalargo.WithMetaDataOpts(
				scalargo.WithTitle("Unwind"),
			),
			scalargo.WithTheme(scalargo.ThemeDeepSpace),
			scalargo.WithLayout(scalargo.LayoutModern),
			// scalargo.WithBaseServerURL("http://localhost:2020/"),
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(http.StatusOK, content)
	})

	docsGroup.GET("/swagger.json", func(c *gin.Context) {
		c.File(specUrl)
	})
}
