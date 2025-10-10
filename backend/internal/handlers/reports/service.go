package reports

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *ReportsHandler) RegisterRoutes(router *gin.Engine) {
	report := router.Group("api/reports")
	{
		report.GET("/all", utils.AuthMiddleware(), h.ListReports)
		report.GET("/yours/manager", utils.AuthMiddleware(), h.ManagerListReports)
		report.GET("/yours/manager/pending", utils.AuthMiddleware(), h.ManagerPendingReports)
		report.GET("/export/:id/csv", h.ExportReportCSV)
		report.GET("/download/:filename", utils.AuthMiddleware(), h.ReportFileDownload)

		report.POST("/add", utils.AuthMiddleware(), h.AddReport)
		report.POST("/add/assignee/:id", utils.AuthMiddleware(), h.AssigneeAddReport)
		report.POST("/approve/manager/:id", utils.AuthMiddleware(), h.ReviewReport)
	}
}
