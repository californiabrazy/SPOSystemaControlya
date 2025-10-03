package server

import (
	"net/http"

	"systemacontrolya/internal/handlers/admin"
	"systemacontrolya/internal/handlers/auth"
	"systemacontrolya/internal/handlers/defects"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3001"}, //Docker - 3001, Local - 3000
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.OPTIONS("/*path", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	//Login
	authHandler := auth.NewAuthHandler(s.db.DB())
	authHandler.RegisterRoutes(r)

	//Admin Panel
	adminHandler := admin.NewAdminHandler(s.db.DB())
	adminHandler.RegisterRoutes(r)

	//Defects
	defectHandler := defects.NewDefectHandler(s.db.DB())
	defectHandler.RegisterRoutes(r)

	return r
}
