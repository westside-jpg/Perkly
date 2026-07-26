package routers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterClientsRoutes(r *gin.Engine, db *pgxpool.Pool) {

	r.GET("/api/get-products-and-categories", func(c *gin.Context) {
		rows, err := db.Query(
			context.Background(),
			`SELECT 
				p.id, p.category_id, p.name, c.name, p.unit, p.image_url,
				MIN(pv.volume), MIN(pv.price_base), MIN(pv.calories_base)
			FROM products p
			JOIN categories c ON c.id = p.category_id
			JOIN product_variants pv ON pv.product_id = p.id
			GROUP BY p.id, p.category_id, p.name, c.name, p.unit, p.image_url
			ORDER BY p.category_id, p.id`,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки товаров"})
			return
		}
		defer rows.Close()

		type ProductCard struct {
			ID           int    `json:"id"`
			CategoryID   int    `json:"category_id"`
			Name         string `json:"name"`
			CategoryName string `json:"category_name"`
			Unit         string `json:"unit"`
			ImageURL     string `json:"image_url"`
			MinVolume    int    `json:"min_volume"`
			MinPrice     int    `json:"min_price"`
			MinCalories  int    `json:"min_calories"`
		}

		var products []ProductCard
		for rows.Next() {
			var p ProductCard
			if err := rows.Scan(&p.ID, &p.CategoryID, &p.Name, &p.CategoryName, &p.Unit, &p.ImageURL, &p.MinVolume, &p.MinPrice, &p.MinCalories); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка чтения товаров"})
				return
			}
			products = append(products, p)
		}

		c.JSON(http.StatusOK, gin.H{"products": products})
	})
}
