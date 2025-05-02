package router

import (
	"backend/pkg/projectpath"
	"fmt"
	"net/http"
	"path/filepath"

	scalargo "github.com/bdpiprava/scalar-go"
	"github.com/gin-gonic/gin"
)

func RegisterDocsRoutes(router *gin.RouterGroup) {
	docsGroup := router
	fmt.Println("in")
	specUrl := filepath.Join(projectpath.Root, "/internal/docs/openapi.json")
	fmt.Println("2")
	fmt.Println("Serving spec from:", specUrl)
	docsGroup.GET("/test", func(c *gin.Context) {
		c.String(http.StatusOK, "Docs group is working")
	})
	// spec2Url := filepath.Join(projectpath.Root, "/oas.json")

	fmt.Println("routing")
	docsGroup.GET("/reference", func(c *gin.Context) {
		fmt.Println("httping")
		content, err := scalargo.NewV2(
			scalargo.WithSpecURL("/api/v1/docs/swagger.json"),
			scalargo.WithMetaDataOpts(
				scalargo.WithTitle("Unwind"),
			),
			scalargo.WithTheme(scalargo.ThemeDeepSpace),
			scalargo.WithLayout(scalargo.LayoutClassic),
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
