package auth

import (
	"fmt"
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных или данные не введены"})
		return
	}

	var user models.User
	if err := h.db.Preload("Role").Where("email = ?", input.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный Email или пароль"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
		}
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный Email или пароль"})
		return
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":   user.ID,
		"role": user.Role.Name,
		"exp":  time.Now().Add(time.Minute * 1).Unix(),
	})

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":   user.ID,
		"role": user.Role.Name,
		"exp":  time.Now().Add(time.Hour * 24 * 7).Unix(),
	})

	accessString, _ := accessToken.SignedString([]byte(os.Getenv("JWT_SECRET")))
	refreshString, _ := refreshToken.SignedString([]byte(os.Getenv("JWT_REFRESH_SECRET")))

	c.SetCookie(
		"refresh_token",
		refreshString,
		60*60*24*7,
		"/",
		"",
		false, // secure (HTTPS)
		true,  // HttpOnly
	)

	c.JSON(http.StatusOK, gin.H{
		"access_token": accessString,
		"user": gin.H{
			"first_name": user.FirstName,
		},
	})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshString, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Нет refresh токена"})
		return
	}

	token, err := jwt.Parse(refreshString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("неожиданный метод подписи: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("JWT_REFRESH_SECRET")), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Недействительный refresh токен"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Недействительный refresh токен"})
		return
	}

	userID := uint(claims["id"].(float64))
	role := claims["role"].(string)

	newAccess := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":   userID,
		"role": role,
		"exp":  time.Now().Add(time.Minute * 15).Unix(),
	})

	newAccessString, err := newAccess.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка генерации access токена"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": newAccessString,
	})
}

func (h *AuthHandler) Check(c *gin.Context) {
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")

	c.JSON(http.StatusOK, gin.H{
		"message": "Токен действителен",
		"id":      userID,
		"role":    role,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("refresh_token", "", -1, "/", "", true, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Вы успешно вышли из аккаунта",
	})
}
