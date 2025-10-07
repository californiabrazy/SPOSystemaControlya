package reports

import (
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *ReportsHandler) RegisterRoutes(router *gin.Engine) {
	report := router.Group("api/reports")
	{
		report.GET("/download/:filename", utils.AuthMiddleware(), h.DownloadReportFile)
		report.GET("/all", utils.AuthMiddleware(), h.ListReports)
		report.GET("/your", utils.AuthMiddleware(), h.ManagerListReports)

		report.POST("/add", utils.AuthMiddleware(), h.AddReport)
	}
}
