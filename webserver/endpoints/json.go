package endpoints

import (
	"sysfas/webserver/fileloader"

	"github.com/gin-gonic/gin"
)

// ServeJSON loads the JSON for the current request path and writes it as the response.
// The route is passed through from the router (e.g. /products, /capabilities); the fileloader
// chooses the correct loader based on that path.
func ServeJSON(c *gin.Context) {
	path := c.Request.URL.Path
	data, err := fileloader.LoadJSONForPath(path)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, data)
}
