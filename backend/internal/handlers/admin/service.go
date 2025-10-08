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
		admin.GET("/available_managers", utils.AuthMiddleware(), h.AvaliableManagers)
		admin.GET("/projects", utils.AuthMiddleware(), h.ListProjects)
		admin.GET("/available_assignees", utils.AuthMiddleware(), h.AvaliableAssignees)

		admin.POST("/projects", utils.AuthMiddleware(), h.AddProject)
		admin.POST("/users", utils.AuthMiddleware(), h.AddUser)

		admin.DELETE("/delete_user", utils.AuthMiddleware(), h.DeleteUser)
		admin.DELETE("/delete_project", utils.AuthMiddleware(), h.DeleteProject)
	}
}
