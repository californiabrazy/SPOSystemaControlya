package admin

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *AdminHandler) RegisterRoutes(router *gin.Engine) {
	auth := router.Group("/admin")
	{
		auth.POST("/users", utils.AuthMiddleware(), h.AddUser)
		auth.GET("/roles", utils.AuthMiddleware(), h.ListRoles)
		auth.GET("/users", utils.AuthMiddleware(), h.ListUsers)
		auth.POST("/projects", utils.AuthMiddleware(), h.AddProject)
		auth.GET("/available_managers", utils.AuthMiddleware(), h.AvaliableManagers)
		auth.GET("/projects", utils.AuthMiddleware(), h.ListProjects)
	}
}
