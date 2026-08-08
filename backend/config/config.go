package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

var envLoaded bool

// Пробуем .env в корне репозитория и рядом с бинарником.
// В Docker переменные приходят из compose, файл не обязателен.
func loadEnv() {
	if envLoaded {
		return
	}

	_ = godotenv.Load("../.env")
	_ = godotenv.Load(".env")

	envLoaded = true
}

type RedisConfig struct {
	Addr     string
	Password string
	DB       int
}

func GetDatabaseURL() string {
	loadEnv()
	return os.Getenv("DATABASE_URL")
}

func GetRedisConfig() RedisConfig {
	loadEnv()

	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		addr = "localhost:6379"
	}

	db := 0
	if dbStr := os.Getenv("REDIS_DB"); dbStr != "" {
		if parsed, err := strconv.Atoi(dbStr); err == nil {
			db = parsed
		}
	}

	return RedisConfig{
		Addr:     addr,
		Password: os.Getenv("REDIS_PASSWORD"),
		DB:       db,
	}
}
