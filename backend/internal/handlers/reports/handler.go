package reports

import (
	"bytes"
	"encoding/csv"
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

func (h *ReportsHandler) BossListReports(c *gin.Context) {
	var reports []models.Report
	if err := h.db.
		Joins("JOIN defects on defects.id = reports.defect_id").
		Where("defects.status = ? AND reports.status = ?", "closed", "approve").
		Preload("User").Preload("Project").
		Find(&reports).Error; err != nil {
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

	if err := h.db.
		Joins("JOIN projects ON projects.id = reports.project_id").
		Joins("JOIN defects on defects.id = reports.defect_id").
		Preload("Project").
		Where("projects.manager_id = ? AND defects.status = ?", managerID, "resolved").
		Find(&reports).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Отчёты менеджера не найдены"})
		return
	}

	c.JSON(http.StatusOK, reports)
}

func (h *ReportsHandler) ReportFileDownload(c *gin.Context) {
	filename := c.Param("filename")

	filePath := filepath.Join("uploads", "reports", filename)

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Файл не найден"})
		return
	}

	c.FileAttachment(filePath, filename)
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

func (h *ReportsHandler) AssigneeAddReport(c *gin.Context) {
	defectID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID дефекта"})
		return
	}

	var defect models.Defect
	if err := h.db.Where("id = ?", defectID).First(&defect).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Дефект не найден"})
		return
	}

	role, exists := c.Get("role")
	if !exists || role != "Исполнитель" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Для отправки отчета нужно быть исполнителем"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}
	if defect.AssigneeID == nil || *defect.AssigneeID != uint(userID.(float64)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Вы не назначены на этот дефект"})
		return
	}

	if defect.Status != "in_progress" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Дефект должен быть в статусе 'in_progress'"})
		return
	}

	title := c.PostForm("title")
	description := c.PostForm("description")
	if title == "" || description == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Название и описание отчета обязательны"})
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка загрузки файлов"})
		return
	}
	files := form.File["attachments"]

	var paths []string
	for _, file := range files {
		savePath := fmt.Sprintf("uploads/reports/%s", file.Filename)
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сохранить файл"})
			return
		}
		paths = append(paths, "/"+savePath)
	}

	report := models.Report{
		Title:       title,
		Description: description,
		FilePaths:   paths,
		Status:      "pending",
		ProjectID:   defect.ProjectID,
		UserID:      uint(userID.(float64)),
		DefectID:    uint(defectID),
		CreatedAt:   time.Now(),
	}

	if err := h.db.Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать отчёт"})
		return
	}

	defect.Status = "in_progress"
	if err := h.db.Save(&defect).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить дефект"})
		return
	}

	h.db.Preload("Project").Preload("Author").Preload("Assignee").First(&defect, defectID)
	c.JSON(http.StatusCreated, gin.H{
		"report": report,
		"defect": defect,
	})
}

func (h *ReportsHandler) ManagerReviewReport(c *gin.Context) {
	reportID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID отчета"})
		return
	}

	var report models.Report
	if err := h.db.First(&report, reportID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Отчёт не найден"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Не удалось получить ID текущего пользователя"})
	}
	managerID := uint(userID.(float64))

	var defect models.Defect
	if err := h.db.First(&defect, report.DefectID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Дефект не найден"})
		return
	}

	var project models.Project
	if err := h.db.First(&project, defect.ProjectID).Error; err != nil || project.ManagerID != managerID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав"})
		return
	}

	if defect.Status != "resolved" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Дефект должен быть в статусе 'resolved'"})
		return
	}

	var input struct {
		Decision string `json:"decision" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	if input.Decision != "approve" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Статус отчета после проверки инженера должен быть approve"})
	}

	if report.Status != "approve" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Отчет должен быть подтвержден инженером"})
		return
	}

	defect.Status = "closed"

	if err := h.db.Save(&defect).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось проверить дефект"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"report": report, "defect": defect})
}

func (h *ReportsHandler) ManagerPendingReports(c *gin.Context) {
	userIDv, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}
	managerID := uint(userIDv.(float64))

	var reports []models.Report
	if err := h.db.
		Joins("JOIN defects ON defects.id = reports.defect_id").
		Joins("JOIN projects ON projects.id = reports.project_id").
		Where("reports.status = ? AND defects.status = ? AND projects.manager_id = ?", "approve", "resolved", managerID).
		Preload("Project").
		Preload("User").
		Preload("Defect").
		Find(&reports).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения отчётов"})
		return
	}

	c.JSON(http.StatusOK, reports)
}

func (h *ReportsHandler) EngineerReviewReport(c *gin.Context) {
	reportID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID отчета"})
		return
	}

	var report models.Report
	if err := h.db.First(&report, reportID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Отчёт не найден"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var defect models.Defect
	if err := h.db.First(&defect, report.DefectID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Дефект не найден"})
		return
	}

	if defect.AuthorID != uint(userID.(float64)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Вы не назначены инженером для этого дефекта"})
		return
	}

	if defect.Status != "in_progress" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Дефект должен быть в статусе 'in_progress'"})
		return
	}

	var input struct {
		Decision string `json:"decision" binding:"required,oneof=approve reject"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	report.Status = input.Decision

	if input.Decision == "reject" {
		defect.Status = "in_progress"
		if err := h.db.Delete(&report, reportID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Не удалось удалить дефект"})
			return
		}
	} else {
		defect.Status = "resolved"
	}

	if err := h.db.Save(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить отчёт"})
		return
	}

	if err := h.db.Save(&defect).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить дефект"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"report": report, "defect": defect})
}

func (h *ReportsHandler) EngineerPendingReports(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	engineerID := uint(userID.(float64))

	var reports []models.Report
	if err := h.db.Where("status = ? AND defect_id IN (SELECT id FROM defects WHERE author_id = ?)", "pending", engineerID).
		Preload("Defect").Preload("Project").Preload("User").Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения отчётов"})
		return
	}

	c.JSON(http.StatusOK, reports)
}

func (h *ReportsHandler) LeaderReportsStats(c *gin.Context) {
	role, exists := c.Get("role")
	if !exists || role != "Руководитель" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Только руководитель может получить данные по отчетам для графиков"})
		return
	}

	type DailyReports struct {
		Date  time.Time `json:"date"`
		Count int       `json:"count"`
	}

	var stats []DailyReports

	if err := h.db.
		Table("reports").
		Select("DATE(created_at) AS date, COUNT(*) AS count").
		Where("created_at >= CURRENT_DATE - INTERVAL '7 days'").
		Group("DATE(created_at)").
		Order("DATE(created_at)").
		Scan(&stats).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить статистику отчетов"})
		return
	}

	c.JSON(http.StatusOK, stats)
}
