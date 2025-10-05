package projects

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *ProjectsHandler) RegisterRoutes(router *gin.Engine) {
	project := router.Group("api/projects")
	{
		project.GET("/your", utils.AuthMiddleware(), h.ManagerListProjects)
	}
}
