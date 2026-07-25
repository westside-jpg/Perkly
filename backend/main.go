package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/westside-jpg/Perkly/backend/config"
	"github.com/westside-jpg/Perkly/backend/database"
	"github.com/westside-jpg/Perkly/backend/routers"
	"github.com/westside-jpg/Perkly/backend/seed"
)

func main() {
	db := database.Connect(config.GetDatabaseURL())
	err := database.CreateTables(db)
	if err != nil {
		log.Fatal("Не удалось создать таблицы!")
	}
	defer db.Close()

	_ = seed.SetupSeeds(db)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS", "DELETE", "PATCH"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
	}))

	routers.SetupRoutes(r, db)

	err = r.Run()
	if err != nil {
		log.Fatal(err)
	}
}
