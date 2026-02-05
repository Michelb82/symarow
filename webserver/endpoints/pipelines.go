package endpoints

import (
	"encoding/json"
	"sysfas/webserver/fileloader"

	"github.com/gin-gonic/gin"
)

func RenderPipelines(c *gin.Context) {
	data, err := fileloader.LoadPipelines()
	if err != nil {
		c.HTML(500, "error.html", gin.H{"error": err.Error()})
		return
	}
	jsonData, _ := json.Marshal(data)
	c.HTML(200, "pipelines.html", gin.H{"Data": string(jsonData)})
}
