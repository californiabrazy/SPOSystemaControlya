package admin

import (
	"net/http"

	"systemacontrolya/internal/models"
	"systemacontrolya/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminHandler struct {
	db *gorm.DB
}

func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{db: db}
}

func (h *AdminHandler) AddUser(c *gin.Context) {
	var input models.User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка хеширования пароля"})
		return
	}

	user := models.User{
		FirstName:  input.FirstName,
		LastName:   input.LastName,
		MiddleName: input.MiddleName,
		Email:      input.Email,
		Password:   hashedPassword,
		RoleID:     input.RoleID,
	}

	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания пользователя"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Пользователь создан",
		"user": gin.H{
			"id":          user.ID,
			"first_name":  user.FirstName,
			"last_name":   user.LastName,
			"middle_name": user.MiddleName,
			"email":       user.Email,
			"role":        user.RoleID,
		},
	})
}

func (h *AdminHandler) AddProject(c *gin.Context) {
	var input models.CreateProjectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	project := models.Project{
		Name:        input.Name,
		ManagerID:   input.ManagerID,
		Description: input.Description,
	}

	if err := h.db.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать проект"})
		return
	}
}

func (h *AdminHandler) AvaliableManagers(c *gin.Context) {
	var managerRole models.Role
	if err := h.db.Where("name = ?", "Менеджер").First(&managerRole).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Роль Менеджер не найдена"})
		return
	}

	var availableManagers []models.User
	err := h.db.
		Where("role_id = ?", managerRole.ID).
		Where("id NOT IN (?)", h.db.Model(&models.Project{}).Select("manager_id")).
		Find(&availableManagers).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить список менеджеров"})
		return
	}

	c.JSON(http.StatusOK, availableManagers)
}

func (h *AdminHandler) DeleteUser(c *gin.Context) {
	role, exists := c.Get("role")
	if !exists || role != "Админ" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав"})
		return
	}

	var input struct {
		ID uint `json:"id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	var user models.User
	if err := h.db.First(&user, input.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Такого пользователя не существует"})
		return
	}

	var count int64
	if err := h.db.Model(&models.Project{}).
		Where("manager_id = ?", user.ID).
		Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки связей"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Нельзя удалить менеджера, он закреплен за проектом"})
		return
	}

	if err := h.db.Delete(&models.User{}, user.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Пользователь удалён"})
}

func (h *AdminHandler) DeleteProject(c *gin.Context) {
	role, exists := c.Get("role")
	if !exists || role != "Админ" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав"})
		return
	}

	var input struct {
		ID uint `json:"id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	if err := h.db.Delete(&models.Project{}, input.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Проект удалён"})
}

func (h *AdminHandler) ListRoles(c *gin.Context) {
	var roles []models.Role
	h.db.Find(&roles)
	c.JSON(http.StatusOK, roles)
}

func (h *AdminHandler) ListUsers(c *gin.Context) {
	var users []models.User
	if err := h.db.Preload("Role").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки пользователей"})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *AdminHandler) ListProjects(c *gin.Context) {
	var projects []models.Project
	if err := h.db.Preload("Manager").Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки проектов"})
		return
	}
	c.JSON(http.StatusOK, projects)
}
