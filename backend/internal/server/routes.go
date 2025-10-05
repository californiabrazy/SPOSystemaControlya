package server

import (
	"net/http"

	"systemacontrolya/internal/handlers/admin"
	"systemacontrolya/internal/handlers/auth"
	"systemacontrolya/internal/handlers/defects"
	"systemacontrolya/internal/handlers/projects"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, //Docker - 3001, Local - 3000
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Static("/uploads", "./uploads")

	//Login
	authHandler := auth.NewAuthHandler(s.db.DB())
	authHandler.RegisterRoutes(r)

	//Admin Panel
	adminHandler := admin.NewAdminHandler(s.db.DB())
	adminHandler.RegisterRoutes(r)

	//Defects
	defectHandler := defects.NewDefectHandler(s.db.DB())
	defectHandler.RegisterRoutes(r)

	//Projects
	projectHandler := projects.NewProjectHandler(s.db.DB())
	projectHandler.RegisterRoutes(r)

	return r
}
