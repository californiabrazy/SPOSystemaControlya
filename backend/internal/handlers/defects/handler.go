package defects

import (
	"net/http"
	"strconv"
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

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не удалось определить пользователя"})
		return
	}

	authorID := uint(userID.(float64))

	defect := models.Defect{
		Title:       input.Title,
		Description: input.Description,
		Priority:    input.Priority,
		Status:      input.Status,
		ProjectID:   input.ProjectID,
		AuthorID:    authorID,
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

func (h *DefectHandler) UserListDefects(c *gin.Context) {
	var defects []models.Defect

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не удалось определить пользователя"})
		return
	}

	authorID := uint(userID.(float64))

	if err := h.db.Where("author_id = ?", authorID).Preload("Author").Preload("Project").Find(&defects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки дефектов"})
		return
	}
	c.JSON(http.StatusOK, defects)
}

func (h *DefectHandler) EditDefect(c *gin.Context) {
	defectParamsID := c.Param("id")
	defectID, err := strconv.Atoi(defectParamsID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID дефекта"})
		return
	}

	var input models.CreateDefectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не удалось определить пользователя"})
		return
	}
	authorID := uint(userID.(float64))

	var defect models.Defect
	if err := h.db.First(&defect, defectID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Дефект не найден"})
		return
	}

	defect.Title = input.Title
	defect.Description = input.Description
	defect.Priority = input.Priority
	defect.Status = input.Status
	defect.ProjectID = input.ProjectID
	defect.AuthorID = authorID

	if err := h.db.Save(&defect).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить дефект"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"defect": defect})
}
