package models

import "time"

type Report struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"type:varchar(255);not null"`
	FilePaths   []string  `gorm:"type:jsonb;serializer:json" json:"attachments"`
	Description string    `json:"description" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	Status      string    `json:"status" gorm:"type:varchar(20);not null;check:status IN ('pending','approve','reject');default:pending"`

	ProjectID uint    `json:"project_id" gorm:"not null"`
	Project   Project `gorm:"foreignKey:ProjectID;constraint:OnDelete:CASCADE" json:"project"`

	UserID uint `json:"user_id" gorm:"not null"`
	User   User `gorm:"foreignKey:UserID" json:"user"`

	DefectID uint   `json:"defect_id" gorm:"not null;index"`
	Defect   Defect `gorm:"foreignKey:DefectID;constraint:OnDelete:CASCADE" json:"defect"`
}
