package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

type Service interface {
	Close() error
}

type service struct {
	db *sql.DB
}

var (
	dbInstance *service
)

func New() Service {
	if dbInstance != nil {
		return dbInstance
	}

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Невозможно подключиться к БД: %v", err)
	}

	if err := db.Ping(); err != nil {
		log.Fatalf("Ошибка ответа БД: %v", err)
	}

	dbInstance = &service{db: db}
	return dbInstance
}

func (s *service) Close() error {
	return s.db.Close()
}
