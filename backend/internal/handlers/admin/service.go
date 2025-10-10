package admin

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *AdminHandler) RegisterRoutes(router *gin.Engine) {
	admin := router.Group("api/admin")
	{
		admin.GET("/roles", utils.AuthMiddleware(), h.ListRoles)
		admin.GET("/users", utils.AuthMiddleware(), h.ListUsers)
		admin.GET("/projects", utils.AuthMiddleware(), h.ListProjects)
		admin.GET("/available_managers", utils.AuthMiddleware(), h.AvaliableManagers)
		admin.GET("/available_assignees", utils.AuthMiddleware(), h.AvaliableAssignees)

		admin.POST("/add/project", utils.AuthMiddleware(), h.AddProject)
		admin.POST("/add/user", utils.AuthMiddleware(), h.AddUser)

		admin.DELETE("/delete/user", utils.AuthMiddleware(), h.DeleteUser)
		admin.DELETE("/delete/project", utils.AuthMiddleware(), h.DeleteProject)
	}
}
