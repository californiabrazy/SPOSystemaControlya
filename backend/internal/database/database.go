package database

import (
	"log"
	"os"
	"sync"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Service interface {
	Close() error
	DB() *gorm.DB
}

type service struct {
	db *gorm.DB
}

var (
	dbInstance *service
	once       sync.Once
	initErr    error
)

func New() Service {
	once.Do(func() {
		dsn := os.Getenv("DATABASE_URL")

		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			initErr = err
			log.Fatalf("Не удалось подключиться к базе данных: %v", err)
		}

		dbInstance = &service{db: db}
	})

	return dbInstance
}

func (s *service) Close() error {
	sqlDB, err := s.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

func (s *service) DB() *gorm.DB {
	return s.db
}
