package models

type Project struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `gorm:"type:varchar(30); not null" json:"name"`
	Description string `gorm:"type:varchar(200)" json:"description"`

	ManagerID uint `gorm:"type:integer; not null; unique" json:"manager_id"`
	Manager   User `gorm:"foreignKey:ManagerID" json:"manager"`
}
