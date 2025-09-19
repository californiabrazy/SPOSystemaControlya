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

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  user.ID,
		"exp": time.Now().Add(time.Minute * 1).Unix(),
	})

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 7).Unix(),
	})

	accessString, _ := accessToken.SignedString([]byte(os.Getenv("JWT_SECRET")))
	refreshString, _ := refreshToken.SignedString([]byte(os.Getenv("JWT_REFRESH_SECRET")))

	c.JSON(http.StatusOK, gin.H{
		"access_token":  accessString,
		"refresh_token": refreshString,
		"user": gin.H{
			"first_name": user.FirstName,
		},
	})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	var input struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат"})
		return
	}

	token, err := jwt.Parse(input.RefreshToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_REFRESH_SECRET")), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Недействительный refresh token"})
		return
	}

	claims := token.Claims.(jwt.MapClaims)
	userID := claims["id"]

	newAccess := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  userID,
		"exp": time.Now().Add(time.Minute * 15).Unix(),
	})

	newAccessString, _ := newAccess.SignedString([]byte(os.Getenv("JWT_SECRET")))

	c.JSON(http.StatusOK, gin.H{
		"access_token": newAccessString,
	})
}

func (h *AuthHandler) Check(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Токен действителен"})
}
