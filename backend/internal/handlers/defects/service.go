package defects

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *DefectHandler) RegisterRoutes(router *gin.Engine) {
	defect := router.Group("api/defects")
	{
		defect.GET("/yours", utils.AuthMiddleware(), h.UserListDefects)
		defect.GET("/all", utils.AuthMiddleware(), h.ListDefects)

		defect.POST("/add", utils.AuthMiddleware(), h.AddDefect)

		defect.PUT("/edit/byengineer/:id", utils.AuthMiddleware(), h.EngineerEditDefect)
		defect.PUT("/edit/bymanager/:id", utils.AuthMiddleware(), h.ManagerEditDefect)
	}
}
