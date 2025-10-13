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
	Title       string   `gorm:"type:varchar(200);not null" json:"title"`
	Description string   `gorm:"type:text;not null" json:"description"`
	Priority    string   `gorm:"type:varchar(20);not null;check:priority IN ('low','medium','high','critical')" json:"priority"`
	Attachments []string `gorm:"type:jsonb;serializer:json" json:"attachments"`
}

type ManagerEditDefectInput struct {
	AssigneeID *uint  `json:"assignee_id"`
	Status     string `json:"status"`
}

type DefectAttachment struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	DefectID uint   `json:"defect_id"`
	FilePath string `json:"file_path"`
	FileName string `json:"file_name"`
}

type ProjectSummary struct {
	ID             uint   `json:"id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	DefectsCount   int    `json:"defects_count"`
	EngineersCount int    `json:"engineers_count"`
	AssigneesCount int    `json:"assignees_count"`
}

type ProjectSummaryWithDetails struct {
	ID          uint           `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Defects     []DefectDetail `json:"defects"`
}

type DefectDetail struct {
	ID         uint   `json:"id"`
	Title      string `json:"title"`
	Status     string `json:"status"`
	AuthorID   uint   `json:"author_id"`
	AssigneeID *uint  `json:"assignee_id"`
}
