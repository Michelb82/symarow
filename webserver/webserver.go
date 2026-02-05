package webserver

import (
	"log"
	"sysfas/webserver/endpoints"

	"github.com/gin-gonic/gin"
)

func Routes() {
	r := gin.Default()

	// Load HTML templates (relative to where the binary runs)
	r.LoadHTMLGlob("webserver/templates/*")

	// Serve static files (relative to where the binary runs)
	r.Static("/static", "webserver/static")

	// Routes
	r.GET("/", endpoints.RenderMainPage)
	r.GET("/products", endpoints.RenderProducts)
	r.GET("/capabilities", endpoints.RenderCapabilities)
	r.GET("/teams", endpoints.RenderTeams)
	r.GET("/architecture", endpoints.RenderArchitecture)
	r.GET("/pipelines", endpoints.RenderPipelines)

	// Start server on port 8080 (default)
	// Server will listen on 0.0.0.0:8080 (localhost:8080 on Windows)
	if err := r.Run(); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
