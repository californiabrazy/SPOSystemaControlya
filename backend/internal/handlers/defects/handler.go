package defects

import (
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"systemacontrolya/internal/models"
	"time"

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
	title := c.PostForm("title")
	description := c.PostForm("description")
	priority := c.PostForm("priority")
	projectID, _ := strconv.Atoi(c.PostForm("project_id"))

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не удалось определить пользователя"})
		return
	}
	authorID := uint(userID.(float64))

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка загрузки файлов"})
		return
	}
	files := form.File["attachments"]

	var paths []string
	for _, file := range files {
		savePath := fmt.Sprintf("uploads/defects/%s", file.Filename)
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сохранить файл"})
			return
		}
		paths = append(paths, "/"+savePath)
	}

	defect := models.Defect{
		Title:       title,
		Description: description,
		Priority:    priority,
		Status:      "new",
		ProjectID:   uint(projectID),
		AuthorID:    authorID,
		Attachments: paths,
	}

	if err := h.db.Create(&defect).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания дефекта"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"defect": defect})
}

func (h *DefectHandler) ManagerListDefects(c *gin.Context) {
	var defects []models.Defect

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не удалось определить пользователя"})
		return
	}

	managerID := uint(userID.(float64))

	if err := h.db.Joins("JOIN projects ON projects.id = defects.project_id").
		Where("projects.manager_id = ?", managerID).
		Preload("Project").
		Preload("Author").
		Find(&defects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить дефекты"})
		return
	}

	c.JSON(http.StatusOK, defects)
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

func (h *DefectHandler) EngineerEditDefect(c *gin.Context) {
	defectParamsID := c.Param("id")
	defectID, err := strconv.Atoi(defectParamsID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID дефекта"})
		return
	}

	var defect models.Defect
	if err := h.db.First(&defect, defectID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Дефект не найден"})
		return
	}

	if defect.Assignee != "" || defect.Status != "new" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Нельзя редактировать дефект после назначения исполнителя"})
		return
	}

	title := c.PostForm("title")
	description := c.PostForm("description")
	priority := c.PostForm("priority")

	if title != "" {
		defect.Title = title
	}
	if description != "" {
		defect.Description = description
	}
	if priority != "" {
		defect.Priority = priority
	}

	form, err := c.MultipartForm()
	if err == nil && form.File != nil {
		files := form.File["attachments"]
		for _, file := range files {
			safeName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
			savePath := fmt.Sprintf("./uploads/defects/%s", safeName)

			if err := c.SaveUploadedFile(file, savePath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сохранить файл"})
				return
			}

			defect.Attachments = append(defect.Attachments, "/uploads/defects/"+safeName)
		}
	}

	if err := h.db.Save(&defect).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить дефект"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"defect": defect})
}

func (h *DefectHandler) ManagerEditDefect(c *gin.Context) {
	defectParamsID := c.Param("id")
	defectID, err := strconv.Atoi(defectParamsID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID дефекта"})
		return
	}

	var input models.ManagerEditDefectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	var defect models.Defect
	if err := h.db.First(&defect, defectID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Дефект не найден"})
		return
	}

	if defect.Assignee == "" {
		if input.Assignee != "" {
			defect.Assignee = input.Assignee
		}
	} else {
		if input.Assignee != "" && input.Assignee != defect.Assignee {
			c.JSON(http.StatusForbidden, gin.H{"error": "Нельзя изменить назначенного исполнителя"})
			return
		}
	}

	if input.Status != "" {
		if defect.Status == "new" {
			if input.Status != "in_progress" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Из статуса 'new' можно перейти только в 'in_progress'"})
				return
			}
		} else {
			if input.Status == "new" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Нельзя возвращать дефект в статус 'new'"})
				return
			}
		}
		defect.Status = input.Status
	}

	if err := h.db.Save(&defect).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить дефект"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"defect": defect})
}

func (h *DefectHandler) AttachmentsDownload(c *gin.Context) {
	filename := c.Param("filename")

	filePath := fmt.Sprintf("./uploads/defects/%s", filename)

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(404, gin.H{"error": "File not found"})
		return
	}

	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename*=UTF-8''%s", url.PathEscape(filename)))
	c.Header("Content-Type", "application/octet-stream")

	c.File(filePath)
}
