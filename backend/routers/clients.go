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

	r.GET("/api/get-product-information/:id", func(c *gin.Context) {
		id := c.Param("id")

		type ProductInfo struct {
			Name        string `json:"name"`
			Unit        string `json:"unit"`
			Description string `json:"description"`
			ImageURL    string `json:"image_url"`
		}

		// Основная информация о продукте
		var product ProductInfo
		err := db.QueryRow(
			context.Background(),
			`SELECT name, unit, description, image_url
			FROM products 
			WHERE id = $1`,
			id,
		).Scan(&product.Name, &product.Unit, &product.Description, &product.ImageURL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки товара"})
			return
		}

		type Variant struct {
			ID           int `json:"id"`
			Volume       int `json:"volume"`
			CaloriesBase int `json:"calories_base"`
			PriceBase    int `json:"price_base"`
		}

		// Все варианты объёма для этого продукта
		variantRows, err := db.Query(
			context.Background(),
			`SELECT id, volume, calories_base, price_base
			FROM product_variants 
			WHERE product_id = $1 
			ORDER BY volume`,
			id,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки вариантов"})
			return
		}
		defer variantRows.Close()

		var variants []Variant
		for variantRows.Next() {
			var v Variant
			if err := variantRows.Scan(&v.ID, &v.Volume, &v.CaloriesBase, &v.PriceBase); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка чтения вариантов"})
				return
			}
			variants = append(variants, v)
		}

		type Option struct {
			ID            int    `json:"id"`
			Group         string `json:"group"`
			Name          string `json:"name"`
			Volume        int    `json:"volume"`
			Unit          string `json:"unit"`
			PriceDelta    int    `json:"price_delta"`
			CaloriesDelta int    `json:"calories_delta"`
			ImageURL      string `json:"image_url"`
		}
		
		// Все опции, доступные для этого продукта
		optionRows, err := db.Query(
			context.Background(),
			`SELECT o.id, o.group, o.name, o.volume, o.unit, o.price_delta, o.calories_delta, o.image_url
			FROM product_options po
			JOIN options o ON o.id = po.option_id
			WHERE po.product_id = $1
			ORDER BY o.group, o.name`,
			id,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки опций"})
			return
		}
		defer optionRows.Close()

		var options []Option
		for optionRows.Next() {
			var o Option
			if err := optionRows.Scan(&o.ID, &o.Group, &o.Name, &o.Volume, &o.Unit, &o.PriceDelta, &o.CaloriesDelta, &o.ImageURL); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка чтения опций"})
				return
			}
			options = append(options, o)
		}

		c.JSON(http.StatusOK, gin.H{
			"product":  product,
			"variants": variants,
			"options":  options,
		})
	})

}
