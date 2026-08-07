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
    OrderUUID         string    `json:"order_uuid"`
    OrderClientNumber string    `json:"order_client_number"`
    UpdatedAt         time.Time `json:"updated_at"`
}

type Product struct {
    Name   string `json:"name"`
    Volume string `json:"volume"`
    Unit   string `json:"unit"`
}

type Option struct {
    Name   string `json:"name"`
    Group  string `json:"group"`
    Volume string `json:"volume"`
    Unit   string `json:"unit"`
}

type OrderPiece struct {
    Product Product  `json:"product"`
    Options []Option `json:"options"`
}

type Order struct {
    CommonOrderInfo CommonOrderInfo `json:"common_order_info"`
    Goods           []OrderPiece    `json:"goods"`
}

func RegisterEmployeesRoutes(r *gin.Engine, db *pgxpool.Pool, rdb *redis.Client) {
	r.GET("/api/barista/get-new-orders", func(c *gin.Context) {
		// Список айди всех новых заказов
		newOrdersIDs := []int{}
		ordersRows, err := db.Query(
			context.Background(),
			`SELECT id FROM orders WHERE status = 'paid'`,
		)
		if err != nil {
			log.Printf("Ошибка получения айди новых товаров из БД: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		defer ordersRows.Close()

		for ordersRows.Next() {
			var id int
			if err = ordersRows.Scan(&id); err != nil {
				log.Printf("Ошибка чтения айди новых товаров из БД: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка базы данных",
				})
				return
			}
			newOrdersIDs = append(newOrdersIDs, id)
		}

		// Инициализацуем orders именно так, чтобы при отсутствии
		// новых заказов на фронт пришел [], а не null
		orders := []Order{}
		for _, newOrderID := range newOrdersIDs {

			// Получение общей информации о заказе
			var commonOrderInfo CommonOrderInfo

			err = db.QueryRow(
				context.Background(),
				`SELECT order_uuid, order_client_number, updated_at
				FROM orders
				WHERE id = $1`,
				newOrderID,
			).Scan(&commonOrderInfo.OrderUUID, &commonOrderInfo.OrderClientNumber, &commonOrderInfo.UpdatedAt)
			if err != nil {
				log.Printf("Ошибка получения основной информации о товарах из БД: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка базы данных",
				})
				return
			}

			// Мап для продуктов из заказа [id (primary key)]: product_variant_id
			productsIDs := make(map[int]int)
			itemRows, err := db.Query(
				context.Background(),
				`SELECT id, product_variant_id
				FROM order_items
				WHERE order_id = $1`,
				newOrderID,
			)
			if err != nil {
				log.Printf("Ошибка получения айди продуктов в заказе из БД: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка базы данных",
				})
				return
			}

			for itemRows.Next() {
				var id, productVariantID int
				if err := itemRows.Scan(&id, &productVariantID); err != nil {
					log.Printf("Ошибка чтения айди продуктов в заказе из БД: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{
						"error": "Ошибка базы данных",
					})
					itemRows.Close()
					return
				}
				productsIDs[id] = productVariantID
			}
			itemRows.Close()

			// Список товаров одного заказа
			goods := []OrderPiece{}
			for key, value := range productsIDs {

				optRows, err := db.Query(
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
				options := []Option{}
				for optRows.Next() {
					var option Option
					if err := optRows.Scan(&option.Name, &option.Group, &option.Volume, &option.Unit); err != nil {
						log.Printf("Ошибка чтения информации об опциях в заказе из БД: %v", err)
						c.JSON(http.StatusInternalServerError, gin.H{
							"error": "Ошибка базы данных",
						})
						optRows.Close()
						return
					}
					options = append(options, option)
				}
				optRows.Close()

				// Конкретный товар
				var product Product
				err = db.QueryRow(
					context.Background(),
					`SELECT p.name, pv.volume, p.unit 
					 FROM product_variants pv
					 JOIN products p ON p.id = pv.product_id
					 WHERE pv.id = $1`,
					 value,
				).Scan(&product.Name, &product.Volume, &product.Unit)

				if err != nil {
					log.Printf("Ошибка получения продукта: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
					return
				}

				good := OrderPiece{
					Product: product,
					Options: options,
				}
				goods = append(goods, good)

			}

			order := Order{
				CommonOrderInfo: commonOrderInfo,
				Goods: goods,
			}
			
			orders = append(orders, order)
		}

		c.JSON(http.StatusOK, gin.H{"orders": orders})
	})
}
