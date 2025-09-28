package defects

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *DefectHandler) RegisterRoutes(router *gin.Engine) {
	auth := router.Group("api/defects")
	{
		auth.POST("/add", utils.AuthMiddleware(), h.AddDefect)
		auth.GET("/all", utils.AuthMiddleware(), h.ListDefects)
	}
}
