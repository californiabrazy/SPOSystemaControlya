package auth

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *AuthHandler) RegisterRoutes(router *gin.Engine) {
	auth := router.Group("/auth")
	{
		auth.POST("/login", h.Login)
		auth.POST("/refresh", h.Refresh)
		auth.GET("/check_token", utils.AuthMiddleware(), h.Check)
	}
}
