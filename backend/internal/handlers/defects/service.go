package defects

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *DefectHandler) RegisterRoutes(router *gin.Engine) {
	defect := router.Group("api/defects")
	{
		defect.GET("/yours", utils.AuthMiddleware(), h.UserListDefects)
		defect.GET("/yours/manager", utils.AuthMiddleware(), h.ManagerListDefects)
		defect.GET("/download/:filename", h.AttachmentsDownload)
		defect.GET("/yours/assignee", utils.AuthMiddleware(), h.AssigneeListDefects)

		defect.POST("/add", utils.AuthMiddleware(), h.AddDefect)

		defect.PUT("/edit/byengineer/:id", utils.AuthMiddleware(), h.EngineerEditDefect)
		defect.PUT("/edit/bymanager/:id", utils.AuthMiddleware(), h.ManagerEditDefect)
	}
}
