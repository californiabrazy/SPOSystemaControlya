package defects

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *DefectHandler) RegisterRoutes(router *gin.Engine) {
	defect := router.Group("api/defects")
	{
		defect.GET("/yours/engineer", utils.AuthMiddleware(), h.EngineerListDefects)
		defect.GET("/yours/manager", utils.AuthMiddleware(), h.ManagerListDefects)
		defect.GET("/yours/assignee", utils.AuthMiddleware(), h.AssigneeListDefects)
		defect.GET("/download/:filename", h.AttachmentsDownload)

		defect.POST("/add", utils.AuthMiddleware(), h.AddDefect)

		defect.PUT("/edit/engineer/:id", utils.AuthMiddleware(), h.EngineerEditDefect)
		defect.PUT("/edit/manager/:id", utils.AuthMiddleware(), h.ManagerEditDefect)
	}
}
