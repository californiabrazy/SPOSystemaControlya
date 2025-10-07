package reports

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
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

	var project models.Project
	if err := h.db.Where("manager_id = ?", userID).First(&project).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Проект менеджера не найден"})
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
		ProjectID:   project.ID,
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

func (h *ReportsHandler) ExportReportCSV(c *gin.Context) {
	id := c.Param("id")

	var report models.Report
	if err := h.db.Preload("User").Preload("Project").First(&report, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Отчёт не найден"})
		return
	}

	b := &bytes.Buffer{}
	b.Write([]byte{0xEF, 0xBB, 0xBF})

	writer := csv.NewWriter(b)
	writer.Comma = ';'

	writer.Write([]string{"Название", "Описание", "Дата создания", "Автор", "Проект"})

	writer.Write([]string{
		report.Title,
		report.Description,
		report.CreatedAt.Format("2006-01-02 15:04"),
		fmt.Sprintf("%s %s", report.User.LastName, report.User.FirstName),
		report.Project.Name,
	})

	writer.Flush()

	filename := fmt.Sprintf("report_%d.csv", report.ID)
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Data(http.StatusOK, "text/csv; charset=utf-8", b.Bytes())
}
