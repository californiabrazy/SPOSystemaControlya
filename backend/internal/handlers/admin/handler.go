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

func (h *AdminHandler) ListRoles(c *gin.Context) {
	var roles []models.Role
	h.db.Find(&roles)
	c.JSON(http.StatusOK, roles)
}
