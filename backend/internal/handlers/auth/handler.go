package auth

import (
	"net/http"
	"os"
	"time"

	"systemacontrolya/internal/models"
	"systemacontrolya/internal/utils"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

func (h *AuthHandler) RegisterRoutes(router *gin.Engine) {
	auth := router.Group("/auth")
	{
		auth.POST("/login", h.Login)
		auth.GET("/check_token", utils.AuthMiddleware(), h.Check)
	}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input models.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	var user models.User
	if err := h.db.Where("email = ?", input.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный email или пароль"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
		}
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный email или пароль"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": user.Email,
		"id":    user.ID,
		"exp":   time.Now().Add(time.Minute * 1).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка генерации токена"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Вход выполнен успешно",
		"access_token": tokenString,
		"user": gin.H{
			"first_name": user.FirstName,
		},
	})
}

func (h *AuthHandler) Check(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Токен действителен"})
}
