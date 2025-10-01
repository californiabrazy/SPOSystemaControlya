package defects

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *DefectHandler) RegisterRoutes(router *gin.Engine) {
	defect := router.Group("api/defects")
	{
		defect.GET("/yours", utils.AuthMiddleware(), h.UserListDefects)

		defect.POST("/add", utils.AuthMiddleware(), h.AddDefect)

		defect.PUT("/edit/:id", utils.AuthMiddleware(), h.EditDefect)
	}
}
