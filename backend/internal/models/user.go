package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Email     string    `gorm:"unique;not null" json:"email" binding:"required,email"`
	Password  string    `gorm:"type:varchar(200);not null" json:"password" binding:"required"`
	FirstName string    `gorm:"type:varchar(30);not null" json:"first_name"`
	LastName  string    `gorm:"type:varchar(30);not null" json:"last_name"`
	RoleID    uint      `gorm:"not null" json:"role_id"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}
