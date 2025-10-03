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
	Password   string `json:"password" binding:"required"`
	RoleID     uint   `json:"role_id" binding:"required"`
}

type CreateProjectInput struct {
	Name        string `json:"name" binding:"required"`
	ManagerID   uint   `json:"manager_id" binding:"required"`
	Description string `json:"description"`
}

type CreateDefectInput struct {
	Title       string `gorm:"type:varchar(200);not null" json:"title"`
	Description string `gorm:"type:text;not null" json:"description"`
	Priority    string `gorm:"type:varchar(20);not null;check:priority IN ('low','medium','high','critical')" json:"priority"`
	ProjectID   uint   `gorm:"not null" json:"projectId"`
	AuthorID    uint   `gorm:"not null" json:"author_id"`
}

type EngineerEditDefectInput struct {
	Title       string `gorm:"type:varchar(200);not null" json:"title"`
	Description string `gorm:"type:text;not null" json:"description"`
	Priority    string `gorm:"type:varchar(20);not null;check:priority IN ('low','medium','high','critical')" json:"priority"`
}

type ManagerEditDefectInput struct {
	Status   string `gorm:"type:varchar(20);not null;check:status IN ('new','in_progress','resolved','closed','reopened')" json:"status"`
	Assignee string `gorm:"type:varchar(30)" json:"assignee"`
}
