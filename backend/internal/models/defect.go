package models

import (
	"time"
)

type Defect struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Title       string    `gorm:"type:varchar(200);not null" json:"title"`
	Description string    `gorm:"type:text;not null" json:"description"`
	Priority    string    `gorm:"type:varchar(20);not null;check:priority IN ('low','medium','high','critical')" json:"priority"`
	Status      string    `gorm:"type:varchar(20);not null;check:status IN ('new','in_progress','resolved','closed','reopened')" json:"status"`
	Assignee    string    `gorm:"type:varchar(30)" json:"assignee"`
	CreatedAt   time.Time `gorm:"type:timestamp with time zone;default:CURRENT_TIMESTAMP;not null" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"type:timestamp with time zone;default:CURRENT_TIMESTAMP;not null" json:"updatedAt"`

	ProjectID uint    `gorm:"not null" json:"project_id"`
	Project   Project `gorm:"foreignKey:ProjectID;constraint:OnDelete:CASCADE" json:"project"`

	AuthorID uint `json:"author_id"`
	Author   User `gorm:"foreignKey:AuthorID" json:"author"`
}
