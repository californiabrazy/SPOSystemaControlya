package projects

import (
	"net/http"
	"systemacontrolya/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProjectsHandler struct {
	db *gorm.DB
}

func NewProjectHandler(db *gorm.DB) *ProjectsHandler {
	return &ProjectsHandler{db: db}
}

func (h *ProjectsHandler) ManagerViewProject(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не удалось определить пользователя"})
		return
	}
	managerID := uint(userID.(float64))

	var summaries []models.ProjectSummary

	err := h.db.Raw(`
		SELECT 
			p.id,
			p.name,
			p.description,
			COUNT(d.id) AS defects_count,
			COUNT(DISTINCT d.author_id) AS engineers_count,
			COUNT(DISTINCT d.assignee_id) AS assignees_count
		FROM projects p
		LEFT JOIN defects d ON d.project_id = p.id
		WHERE p.manager_id = ?
		GROUP BY p.id
	`, managerID).Scan(&summaries).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить проекты"})
		return
	}

	c.JSON(http.StatusOK, summaries)
}

func (h *ProjectsHandler) ListProjects(c *gin.Context) {
	var projects []models.Project
	if err := h.db.Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки проектов"})
		return
	}
	c.JSON(http.StatusOK, projects)
}
