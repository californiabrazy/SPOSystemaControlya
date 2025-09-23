package models

type User struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	Email      string `gorm:"type:varchar(50);not null;unique" json:"email" binding:"required,email"`
	Password   string `gorm:"type:varchar(200);not null" json:"password" binding:"required"`
	FirstName  string `gorm:"type:varchar(30);not null" json:"first_name"`
	LastName   string `gorm:"type:varchar(30);not null" json:"last_name"`
	MiddleName string `gorm:"type:varchar(30)" json:"middle_name"`
	RoleID     uint   `gorm:"not null" json:"role_id"`
	Role       Role   `gorm:"foreignKey:RoleID" json:"role"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type CreateUserInput struct {
	FirstName  string `json:"first_name" binding:"required"`
	LastName   string `json:"last_name" binding:"required"`
	MiddleName string `json:"middle_name"`
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=6"`
	RoleID     uint   `json:"role_id" binding:"required"`
}

type CreateProjectInput struct {
	Name        string `json:"name" binding:"required"`
	ManagerID   uint   `json:"manager_id" binding:"required"`
	Description string `json:"description"`
}
