package endpoints

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func RenderMainPage(c *gin.Context) {
	c.HTML(http.StatusOK, "mainpage.html", nil)
}
