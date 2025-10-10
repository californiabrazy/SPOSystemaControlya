package projects

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *ProjectsHandler) RegisterRoutes(router *gin.Engine) {
	project := router.Group("api/projects")
	{
		project.GET("/yours/manager", utils.AuthMiddleware(), h.ManagerListProjects)
		project.GET("/all", utils.AuthMiddleware(), h.ListProjects)
	}
}
