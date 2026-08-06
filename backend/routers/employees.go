package routers

import (
	"context"
	"time"
	"net/http"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type CommonOrderInfo struct {
	ID 		 		  int
	OrderUUID 		  string
	OrderClientNumber string
	UpdatedAt 		  time.Time
}

func RegisterEmployeesRoutes(r *gin.Engine, db *pgxpool.Pool, rdb *redis.Client) {
	r.GET("/api/barista/get-active-orders", func(c *gin.Context) {
		// Получение общей информации о заказе
		var commonOrderInfo CommonOrderInfo
		err := db.QueryRow(
			context.Background(),
			`SELECT id, order_uuid, order_client_number, updated_at
			FROM orders
			WHERE status = 'paid'`,
		).Scan(&commonOrderInfo.ID, &commonOrderInfo.OrderUUID, 
				&commonOrderInfo.OrderClientNumber, &commonOrderInfo.UpdatedAt)

		if err != nil {
			log.Printf("Ошибка получения основной информации о товаре из БД: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		type Product struct {
			Name      string
			Volume    string
			Unit      string
		}

		type Option struct {
			Name   string
			Group  string
			Volume string
			Unit   string
		}

		type OrderPiece struct {
			Product Product
			Options []Option
		}

		// Мап для продуктов из заказа [id (primary key)]: product_variant_id
		productsIDs := make(map[int]int)
		rows, err := db.Query(
			context.Background(),
			`SELECT id, product_variant_id
			FROM order_items
			WHERE order_id = $1`,
			commonOrderInfo.ID,
		)
		if err != nil {
			log.Printf("Ошибка получения айди продуктов в заказе из БД: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		defer rows.Close()

		for rows.Next() {
			var id, productVariantID int
			if err := rows.Scan(&id, &productVariantID); err != nil {
				log.Printf("Ошибка чтения айди продуктов в заказе из БД: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка базы данных",
				})
				return
			}
			productsIDs[id] = productVariantID
		}

		var order []OrderPiece

		for key, value := range productsIDs {

			rows, err = db.Query(
				context.Background(),
				`SELECT o.name, o."group", o.volume, o.unit
				FROM options o
				JOIN order_item_options oio ON oio.option_id = o.id
				WHERE oio.order_item_id = $1`,
				key,
			)
			if err != nil {
				log.Printf("Ошибка получения информации об опциях в заказе из БД: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка базы данных",
				})
				return
			}
			
			// Список опций для конкретного товара
			var options []Option
			for rows.Next() {
				var option Option
				if err := rows.Scan(&option.Name, &option.Group, &option.Volume, &option.Unit); err != nil {
					log.Printf("Ошибка чтения информации об опциях в заказе из БД: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{
						"error": "Ошибка базы данных",
					})
					rows.Close()
					return
				}
				options = append(options, option)
			}
			rows.Close()

			// Конкретный товар
			var product Product
            err = db.QueryRow(
                context.Background(),
                `SELECT name, volume, unit FROM product_variants WHERE id = $1`,
                value,
            ).Scan(&product.Name, &product.Volume, &product.Unit)

            if err != nil {
                log.Printf("Ошибка получения продукта: %v", err)
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
                return
            }

			piece := OrderPiece{
				Product: product,
				Options: options,
			}

			order = append(order, piece)
		}

	})
}
