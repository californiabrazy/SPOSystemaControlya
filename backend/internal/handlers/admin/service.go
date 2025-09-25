package admin

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *AdminHandler) RegisterRoutes(router *gin.Engine) {
	auth := router.Group("api/admin")
	{
		auth.GET("/roles", utils.AuthMiddleware(), h.ListRoles)
		auth.GET("/users", utils.AuthMiddleware(), h.ListUsers)
		auth.GET("/available_managers", utils.AuthMiddleware(), h.AvaliableManagers)
		auth.GET("/projects", utils.AuthMiddleware(), h.ListProjects)

		auth.POST("/projects", utils.AuthMiddleware(), h.AddProject)
		auth.POST("/users", utils.AuthMiddleware(), h.AddUser)

		auth.DELETE("/delete_user", utils.AuthMiddleware(), h.DeleteUser)
		auth.DELETE("/delete_project", utils.AuthMiddleware(), h.DeleteProject)
	}
}
