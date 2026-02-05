package endpoints

import (
	"encoding/json"
	"sysfas/webserver/fileloader"

	"github.com/gin-gonic/gin"
)

func RenderArchitecture(c *gin.Context) {
	data, err := fileloader.LoadArchitecture()
	if err != nil {
		c.HTML(500, "error.html", gin.H{"error": err.Error()})
		return
	}
	jsonData, _ := json.Marshal(data)
	c.HTML(200, "architecture.html", gin.H{"Data": string(jsonData)})
}
