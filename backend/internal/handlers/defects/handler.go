package defects

import (
	"net/http"
	"systemacontrolya/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DefectHandler struct {
	db *gorm.DB
}

func NewDefectHandler(db *gorm.DB) *DefectHandler {
	return &DefectHandler{db: db}
}

func (h *DefectHandler) AddDefect(c *gin.Context) {
	var input models.CreateDefectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	defect := models.Defect{
		Title:       input.Title,
		Description: input.Description,
		Priority:    input.Priority,
		Status:      "new",
		ProjectID:   input.ProjectID,
		AuthorID:    input.AuthorID,
	}

	if err := h.db.Create(&defect).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания дефекта"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Дефект создан",
		"defect": gin.H{
			"id":          defect.ID,
			"title":       defect.Title,
			"description": defect.Description,
			"priority":    defect.Priority,
			"status":      defect.Status,
			"created_at":  defect.CreatedAt,
			"updated_at":  defect.UpdatedAt,
			"project_id":  defect.ProjectID,
			"author_id":   defect.AuthorID,
		},
	})
}

func (h *DefectHandler) ListDefects(c *gin.Context) {
	var defects []models.Defect

	if err := h.db.Preload("Author").Preload("Project").Find(&defects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки проектов"})
		return
	}
	c.JSON(http.StatusOK, defects)
}
