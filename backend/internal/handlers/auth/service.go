package auth

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *AuthHandler) RegisterRoutes(router *gin.Engine) {
	auth := router.Group("api/auth")
	{
		auth.POST("/login", h.Login)
		auth.POST("/refresh", h.Refresh)
		auth.GET("/check_token", utils.AuthMiddleware(), h.Check)
		auth.POST("/logout", h.Logout)
	}
}
