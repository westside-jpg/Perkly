package routers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterClientsRoutes(r *gin.Engine, db *pgxpool.Pool) {

	r.GET("/api/get-categories", func(c *gin.Context) {

		rows, err := db.Query(
			context.Background(),
			`SELECT name FROM categories`,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H {
				"error": "Ошибка загрузки категорий",
			})
			return
		}

		defer rows.Close()

		var categories []string
		for rows.Next() {
			var name string
			err = rows.Scan(&name)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка чтения категорий",
				})
				return
			}
			categories = append(categories, name)
		}

		c.JSON(http.StatusOK, gin.H{
			"categories": categories,
		})

	})
}
