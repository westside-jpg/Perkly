package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

/*
GetDatabaseURL загружает переменные окружения из файла .env
(если он присутствует) и возвращает значение переменной DATABASE_URL.
Если файла .env нет или произошла ошибка его чтения, функция не падает,
а выводит сообщение в лог
*/
func GetDatabaseURL() string {
	err := godotenv.Load("../.env")

	if err != nil {
		log.Println(".env")
	}

	return os.Getenv("DATABASE_URL")
}
