package reports

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"systemacontrolya/internal/models"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ReportsHandler struct {
	db *gorm.DB
}

func NewReportsHandler(db *gorm.DB) *ReportsHandler {
	return &ReportsHandler{db: db}
}

func (h *ReportsHandler) AddReport(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не удалось определить пользователя"})
		return
	}
	userID := uint(userIDVal.(float64))

	roleVal, ok := c.Get("role")
	if !ok || roleVal.(string) != "Менеджер" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Доступ разрешен только менеджеру"})
		return
	}

	title := c.PostForm("title")
	description := c.PostForm("description")

	projectIDStr := c.PostForm("project_id")
	projectID, err := strconv.Atoi(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный project_id"})
		return
	}

	uploadDir := filepath.Join("uploads", "reports")
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать директорию для отчетов"})
		return
	}

	form, err := c.MultipartForm()
	if err != nil && err != http.ErrNotMultipart {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка чтения файлов"})
		return
	}

	savedPaths := []string{}
	if form != nil {
		files := form.File["files"]
		for _, file := range files {
			filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
			filePath := filepath.Join(uploadDir, filename)

			if err := c.SaveUploadedFile(file, filePath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сохранения файла"})
				return
			}

			savedPaths = append(savedPaths, filePath)
		}
	}

	report := models.Report{
		Title:       title,
		ProjectID:   uint(projectID),
		UserID:      userID,
		Description: description,
		FilePaths:   savedPaths,
	}

	if err := h.db.Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания отчета"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Отчет создан",
		"report":  report,
	})
}

func (h *ReportsHandler) DownloadReportFile(c *gin.Context) {
	filename := c.Param("filename")

	filePath := filepath.Join("uploads", "reports", filename)

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Файл не найден"})
		return
	}

	c.FileAttachment(filePath, filename)
}

func (h *ReportsHandler) ListReports(c *gin.Context) {
	var reports []models.Report
	if err := h.db.Preload("User").Preload("Project").Find(&reports).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Все отчеты не найдены"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"reports": reports})
}

func (h *ReportsHandler) ManagerListReports(c *gin.Context) {
	var reports []models.Report

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не удалось определить пользователя"})
		return
	}
	managerID := uint(userID.(float64))

	roleVal, ok := c.Get("role")
	if !ok || roleVal.(string) != "Менеджер" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Доступ разрешен только менеджеру"})
		return
	}

	if err := h.db.Where("user_id = ?", managerID).Find(&reports).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Отчеты менеджера не найдены"})
		return
	}

	c.JSON(http.StatusOK, reports)
}
