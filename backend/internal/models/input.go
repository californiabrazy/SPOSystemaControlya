package models

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type CreateUserInput struct {
	FirstName  string `json:"first_name" binding:"required"`
	LastName   string `json:"last_name" binding:"required"`
	MiddleName string `json:"middle_name" binding:"required"`
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=6"`
	RoleID     uint   `json:"role_id" binding:"required"`
}

type CreateProjectInput struct {
	Name        string `json:"name" binding:"required"`
	ManagerID   uint   `json:"manager_id" binding:"required"`
	Description string `json:"description"`
}
