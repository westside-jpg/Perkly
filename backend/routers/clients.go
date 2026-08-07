package routers

import (
	"context"
	"net/http"
	"crypto/rand"
	"fmt"
	"math/big"
	"time"
	"log"
	"errors"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/google/uuid"
	"github.com/westside-jpg/Perkly/backend/utils"
)

type User struct {
	Phone string `json:"phone"`
}

type Registration struct {
	Phone string `json:"phone"`
	Code string  `json:"code"`
}

type ApplyBonuses struct {
	Phone string `json:"phone"`
	Code string  `json:"code"`
	Price int    `json:"price"`
}

type CartItem struct {
	ProductVariantID int   `json:"product_variant_id"`
	OptionIDs        []int `json:"option_ids"`
}

type CheckoutRequest struct {
	Phone string     `json:"phone"`
	Items []CartItem `json:"items"`
}

type PayRequest struct {
	OrderUUID string `json:"order_uuid"`
	Method    string `json:"method"`
	Status    string `json:"status"`
}

func RegisterClientsRoutes(r *gin.Engine, db *pgxpool.Pool, rdb *redis.Client) {

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
			ORDER BY o.group, o.sort_order ASC`,
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

	r.POST("api/user/login", func(c *gin.Context) {
		var req User
		err := c.ShouldBindJSON(&req)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Неправильный запрос",
			})
			return
		}

		if len(strings.TrimSpace(req.Phone)) != 10 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Введите номер полностью",
			})
			return
		}
		
		var bonuses int
		err = db.QueryRow(
			context.Background(),
			"SELECT bonuses FROM users WHERE phone = $1",
			req.Phone,
		).Scan(&bonuses)
		
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Пользователь не найден",
			})
			return
		} else if err != nil {
			log.Printf("Ошибка поиска пользователя в БД: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"bonuses": bonuses,
		})

	})

	r.POST("api/user/start-registration", func(c *gin.Context) {
		var req User
		err := c.ShouldBindJSON(&req)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Неправильный запрос",
			})
			return
		}

		if len(strings.TrimSpace(req.Phone)) != 10 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Введите номер полностью",
			})
			return
		}

		rateLimitKey := fmt.Sprintf("auth:ratelimit:%s", req.Phone)

        if _, err := rdb.Get(context.Background(), rateLimitKey).Result(); err == nil {
            duration, _ := rdb.TTL(context.Background(), rateLimitKey).Result()
            c.JSON(http.StatusBadRequest, gin.H{
                "error": fmt.Sprintf(
					"Слишком частые попытки запроса кода. Попробуйте снова через %d %s",
					int(duration.Seconds()),
					utils.DeclinationWord(int(duration.Seconds()), "секунду", "секунды", "секунд")),
            })
            return
        } else if err != redis.Nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Ошибка базы данных",
            })
            return
        }
		
		var isExist bool
		err = db.QueryRow(
			context.Background(),
			`SELECT EXISTS(
				SELECT 1
				FROM users 
				WHERE phone = $1
			)`,
			req.Phone,
		).Scan(&isExist)

		if err != nil {
			log.Printf("Ошибка поиска пользователя в БД: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		if isExist {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Пользователь уже существует",
			})
			return
		}

		n, err := rand.Int(rand.Reader, big.NewInt(1000000))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Не удалось сгенерировать код",
			})
			return
		}

		code := fmt.Sprintf("%06d", n.Int64())

		codeKey := fmt.Sprintf("auth:code:%s", req.Phone)
		attemptsKey := fmt.Sprintf("auth:attempts:%s", req.Phone)
		ttl := 5 * time.Minute

		// Отчистка старого кода, если пользователь перезапросил
		rdb.Del(context.Background(), codeKey, attemptsKey)

		if err := rdb.Set(c.Request.Context(), rateLimitKey, true, time.Minute).Err(); err != nil {
			log.Printf("Ошибка сохранения ключа для Rate Limiting в Redis: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		if err := rdb.Set(c.Request.Context(), attemptsKey, 5, ttl).Err(); err != nil {
			log.Printf("Ошибка сохранения количества попыток в Redis: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		if err := rdb.Set(c.Request.Context(), codeKey, code, ttl).Err(); err != nil {
			log.Printf("Ошибка сохранения кода в Redis: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{})
		fmt.Printf("Код подтверждения регистрации: %s\n", code)

	})

	r.POST("api/user/verify-registration", func(c *gin.Context) {
		var req Registration
		err := c.ShouldBindJSON(&req)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Неправильный запрос",
			})
			return
		}

		if len(strings.TrimSpace(req.Phone)) != 10 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Введите номер полностью",
			})
			return
		}

		codeKey := fmt.Sprintf("auth:code:%s", req.Phone)
		attemptsKey := fmt.Sprintf("auth:attempts:%s", req.Phone)

		savedCode, err := rdb.Get(context.Background(), codeKey).Result()
		if err == redis.Nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Срок действия кода истек",
			})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		if savedCode != req.Code {
			attemptsLeft, err := rdb.Decr(context.Background(), attemptsKey).Result()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
				return
			}

			if attemptsLeft <= 0 {
				rdb.Del(context.Background(), codeKey, attemptsKey)
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Превышено количество попыток ввода. Запросите код заново",
				})
				return
        	}

			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Неверный код. Осталось попыток: %d", attemptsLeft),
			})
			return
		}

		rateLimitKey := fmt.Sprintf("auth:ratelimit:%s", req.Phone)
		rdb.Del(context.Background(), codeKey, attemptsKey, rateLimitKey)

		_, err = db.Exec(
			context.Background(),
			`INSERT INTO users (phone) VALUES ($1)`,
			req.Phone,
		)

		if err != nil {
			log.Printf("Ошибка вставки пользователя в БД: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Аккаунт успешно создан",
			"bonuses": 200,
		})

	})

	r.POST("api/user/start-verification", func(c *gin.Context) {
		var req User
		err := c.ShouldBindJSON(&req)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Неправильный запрос",
			})
			return
		}

		if len(strings.TrimSpace(req.Phone)) != 10 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Введите номер полностью",
			})
			return
		}

		rateLimitKey := fmt.Sprintf("bonuses:ratelimit:%s", req.Phone)

        if _, err := rdb.Get(context.Background(), rateLimitKey).Result(); err == nil {
            duration, _ := rdb.TTL(context.Background(), rateLimitKey).Result()
            c.JSON(http.StatusBadRequest, gin.H{
                "error": fmt.Sprintf(
					"Слишком частые попытки запроса кода. Попробуйте снова через %d %s",
					int(duration.Seconds()),
					utils.DeclinationWord(int(duration.Seconds()), "секунду", "секунды", "секунд"),
				),
            })
            return
        } else if err != redis.Nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Ошибка базы данных",
            })
            return
        }

		var exists bool
        err = db.QueryRow(
			context.Background(),
			`SELECT EXISTS(
				SELECT 1
				FROM users
				WHERE phone = $1
			)`, req.Phone).Scan(&exists)

        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Ошибка базы данных",
            })
            return
        }

		if !exists {
			c.JSON(http.StatusNotFound, gin.H{
                "error": "Пользователь не найден",
            })
            return
		}

		n, err := rand.Int(rand.Reader, big.NewInt(1000000))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Не удалось сгенерировать код",
			})
			return
		}

		code := fmt.Sprintf("%06d", n.Int64())

		codeKey := fmt.Sprintf("bonuses:code:%s", req.Phone)
		attemptsKey := fmt.Sprintf("bonuses:attempts:%s", req.Phone)
		ttl := 5 * time.Minute

		// Отчистка старого кода, если пользователь перезапросил
		rdb.Del(context.Background(), codeKey, attemptsKey)

		if err := rdb.Set(c.Request.Context(), rateLimitKey, true, time.Minute).Err(); err != nil {
			log.Printf("Ошибка сохранения ключа для Rate Limiting в Redis: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		if err := rdb.Set(c.Request.Context(), attemptsKey, 5, ttl).Err(); err != nil {
			log.Printf("Ошибка сохранения количества попыток в Redis: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Не удалось сохранить количество попыток",
			})
			return
		}

		if err := rdb.Set(c.Request.Context(), codeKey, code, ttl).Err(); err != nil {
			log.Printf("Ошибка сохранения кода в Redis: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Не удалось сохранить код подтверждения",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{})
		fmt.Printf("Код подтверждения списания бонусов: %s\n", code)

	})

	r.POST("api/user/verify", func(c *gin.Context) {
		var req ApplyBonuses
		err := c.ShouldBindJSON(&req)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Неправильный запрос",
			})
			return
		}

		if len(strings.TrimSpace(req.Phone)) != 10 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Введите номер полностью",
			})
			return
		}

		codeKey := fmt.Sprintf("bonuses:code:%s", req.Phone)
		attemptsKey := fmt.Sprintf("bonuses:attempts:%s", req.Phone)

		savedCode, err := rdb.Get(context.Background(), codeKey).Result()
		if err == redis.Nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Срок действия кода истек",
			})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		if savedCode != req.Code {
			attemptsLeft, err := rdb.Decr(context.Background(), attemptsKey).Result()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
				return
			}

			if attemptsLeft <= 0 {
				rdb.Del(context.Background(), codeKey, attemptsKey)
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Превышено количество попыток ввода. Запросите код заново",
				})
				return
        	}

			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Неверный код. Осталось попыток: %d", attemptsLeft),
			})
			return
		}

		rateLimitKey := fmt.Sprintf("bonuses:ratelimit:%s", req.Phone)
		rdb.Del(context.Background(), codeKey, attemptsKey, rateLimitKey)

		bonusKey := fmt.Sprintf("bonuses:apply:%s", req.Phone)
		if err := rdb.Set(c.Request.Context(), bonusKey, true, 15 * time.Minute).Err(); err != nil {
			log.Printf("Ошибка сохранения кода в Redis: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Не удалось сохранить информацию про бонусы",
			})
			return
		}

		var bonuses int
		err = db.QueryRow(
			context.Background(),
			`SELECT bonuses FROM users WHERE phone = $1`,
			req.Phone,
		).Scan(&bonuses)

		if err != nil {
			log.Printf("Ошибка получения бонусов из БД: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"bonuses": bonuses,
		})
		
	})

	r.POST("api/user/verify/cancel", func(c *gin.Context) {
		var req User
		err := c.ShouldBindJSON(&req)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Неправильный запрос",
			})
			return
		}

		if len(strings.TrimSpace(req.Phone)) != 10 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Введите номер полностью",
			})
			return
		}

		bonusKey := fmt.Sprintf("bonuses:apply:%s", req.Phone)
		if err := rdb.Del(context.Background(), bonusKey).Err(); err != nil {
			log.Printf("Ошибка удаления записи (отмена списания бонусов) в Redis: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Не удалось отменить списание бонусов. попробуйте еще раз",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Списание бонусов отменено",
		})

	})

	r.POST("api/order/checkout", func(c *gin.Context) {
		var req CheckoutRequest
		err := c.ShouldBindJSON(&req)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Неправильный запрос",
			})
			return
		}

		if len(req.Items) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Корзина пуста"})
			return
		}

		// Получаем айдишники всех продуктов из корзины
		variantIDs := make([]int, len(req.Items))
		for i, item := range req.Items {
			variantIDs[i] = item.ProductVariantID
		}

		rows, err := db.Query(
			context.Background(),
			`SELECT id, price_base 
			FROM product_variants 
			WHERE id = ANY($1)`,
			variantIDs,
		)
		if err != nil {
			log.Printf("Ошибка получения цен продуктов из БД: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}
		defer rows.Close()

		// Создаем map для продуктов из корзины [айди_варианта]: [его_цена]
		prices := make(map[int]int)
		for rows.Next() {
    		var id, price int
			err = rows.Scan(&id, &price)
			if err != nil {
				log.Printf("Ошибка чтения цен продуктов из БД: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка базы данных",
				})
				return
			}
			prices[id] = price
		}

		if err = rows.Err(); err != nil {
			log.Printf("Ошибка итерирования строк: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		// Получаем айдишники всех опций из корзины
		var optionIDs []int
		for _, item := range req.Items {
			optionIDs = append(optionIDs, item.OptionIDs...)
		}

		// Создаем map для опций из корзины [айди_опции]: [ее_цена]
		optionPrices := make(map[int]int) 

		if len(optionIDs) > 0 {
			optionRows, err := db.Query(
				context.Background(),
				`SELECT id, price_delta 
				FROM options 
				WHERE id = ANY($1)`,
				optionIDs,
			)
			if err != nil {
				log.Printf("Ошибка получения цен опций из БД: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка базы данных",
				})
				return
			}
			defer optionRows.Close()

			for optionRows.Next() {
				var id, price int
				if err := optionRows.Scan(&id, &price); err != nil {
					log.Printf("Ошибка сканирования опций: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{
						"error": "Ошибка базы данных",
					})
					return
				}
				optionPrices[id] = price
			}
		}

		totalPrice := 0

		// Структура посчитанного товара (чтобы потом записать в БД)
		type CalculatedItem struct {
			ProductVariantID int
			BasePrice        int
			OptionIDs        []int
			OptionsTotalPrice int
			ItemTotalPrice   int
		}

		var calculatedItems []CalculatedItem

		for _, item := range req.Items {
			basePrice, exists := prices[item.ProductVariantID]
			if !exists {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Товар не найден",
				})
				return
			}

			// Считаем сумму опций для конкретной позиции
			optionsSum := 0
			for _, optID := range item.OptionIDs {
				optPrice, ok := optionPrices[optID]
				if !ok {
					c.JSON(http.StatusBadRequest, gin.H{
						"error": "Опция не найдена",
					})
					return
				}
				optionsSum += optPrice
			}

			itemTotal := basePrice + optionsSum
			totalPrice += itemTotal

			calculatedItems = append(calculatedItems, CalculatedItem{
				ProductVariantID: item.ProductVariantID,
				BasePrice:        basePrice,
				OptionIDs:        item.OptionIDs,
				OptionsTotalPrice: optionsSum,
				ItemTotalPrice:   itemTotal,
			})
		}


		var finalPrice = totalPrice
		var bonusesUsed = 0

		var userID *int
        phoneClean := strings.TrimSpace(req.Phone)

        if len(phoneClean) == 10 {
            var id, userBonuses int

            err := db.QueryRow(
                context.Background(),
                `SELECT id, bonuses FROM users WHERE phone = $1`,
                phoneClean,
            ).Scan(&id, &userBonuses)

            if err == nil {
                userID = &id

                bonusKey := fmt.Sprintf("bonuses:apply:%s", phoneClean)
                _, errRedis := rdb.Get(context.Background(), bonusKey).Result()

                if errRedis == nil {
                    if totalPrice >= userBonuses {
                        finalPrice = totalPrice - userBonuses
                        bonusesUsed = userBonuses
                    } else {
                        finalPrice = 0
                        bonusesUsed = totalPrice
                    }
                } else if errRedis != redis.Nil {
                    log.Printf("Ошибка получения значения списания бонусов в Redis: %v", errRedis)
                    c.JSON(http.StatusInternalServerError, gin.H{
						"error": "Ошибка базы данных",
					})
                    return
                }
            }
        }

		orderUUID := "ord_" + uuid.New().String()

		// Запись данных в orders, order_items, order_item_options
		tx, err := db.Begin(context.Background())
		if err != nil {
			log.Printf("Ошибка открытия транзакции: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
			return
		}
		defer tx.Rollback(context.Background())

		var newOrderID int
		err = tx.QueryRow(
			context.Background(),
			`INSERT INTO orders (order_uuid, user_id, total_price, bonuses_used, final_price, bonuses_accrued)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id`,
			orderUUID, userID, totalPrice, bonusesUsed, finalPrice, (finalPrice / 10),
		).Scan(&newOrderID)
		if err != nil {
			log.Printf("Ошибка записи значений в таблицу orders: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка базы данных",
			})
			return
		}

		for _, item := range calculatedItems {
			var orderItemID int

			err = tx.QueryRow(
				context.Background(),
				`INSERT INTO order_items (order_id, product_variant_id, price_snapshot)
				VALUES ($1, $2, $3)
				RETURNING id`,
				newOrderID, item.ProductVariantID, item.BasePrice,
			).Scan(&orderItemID)

			if err != nil {
				log.Printf("Ошибка записи в order_items: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
				return
			}

			for _, optID := range item.OptionIDs {
				optPrice := optionPrices[optID]

				_, err = tx.Exec(
					context.Background(),
					`INSERT INTO order_item_options (order_item_id, option_id, price_snapshot)
					VALUES ($1, $2, $3)`,
					orderItemID, optID, optPrice,
				)
				if err != nil {
					log.Printf("Ошибка записи в order_item_options: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
					return
				}
			}
		}

		if err := tx.Commit(context.Background()); err != nil {
			log.Printf("Ошибка фиксации транзакции: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
			return
		}
		
		c.JSON(http.StatusOK, gin.H{
			"order_uuid":  orderUUID,
			"final_price": finalPrice,
		})

	})

	r.POST("api/order/pay", func(c *gin.Context) {
		var req PayRequest
		err := c.ShouldBindJSON(&req)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Неправильный запрос",
			})
			return
		}

		testPaymentID := "test_pay_" + uuid.New().String()

		// Неудачная оплата
		if (req.Status == "declined") {
			_, err = db.Exec(
				context.Background(),
				`UPDATE orders
				SET status = 'cancelled', payment_method = $1, payment_id = $2, updated_at = NOW()
				WHERE order_uuid = $3`,
				req.Method, testPaymentID, req.OrderUUID,
			)

			if err != nil {
				log.Printf("Ошибка записи неудачного заказа: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка базы данных",
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"success": false,
			})
			return
		} 
		
		// Успешная оплата
		if (req.Status == "approved") {
			tx, err := db.Begin(context.Background())
			if err != nil {
				log.Printf("Ошибка открытия транзакции: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
				return
			}
			defer tx.Rollback(context.Background())

			var userID *int
			var phone string
			var bonusesUsed, bonusesAccrued int
			var clientNumber string
			err = tx.QueryRow(
				context.Background(),
				`UPDATE orders
				SET status = 'paid',
				    payment_method = $1,
					order_client_number = LPAD(nextval('order_client_number_seq')::text, 3, '0'),
					payment_id = $2,
					updated_at = NOW()
				WHERE order_uuid = $3
				RETURNING user_id, bonuses_used, bonuses_accrued, order_client_number`,
				req.Method, testPaymentID, req.OrderUUID,
			).Scan(&userID, &bonusesUsed, &bonusesAccrued, &clientNumber)

			if err != nil {
				log.Printf("Ошибка записи удачного заказа: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Заказ не найден",
				})
				return
			}

			if userID != nil {
				err = tx.QueryRow(
					context.Background(), 
					`UPDATE users 
					SET bonuses = bonuses - $1 + $2 
					WHERE id = $3
					RETURNING phone`,
					bonusesUsed, bonusesAccrued, *userID,
				).Scan(&phone)

				if err != nil {
					log.Printf("Ошибка начисления бонусов: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка начисления бонусов"})
					return
				}

				bonusKey := fmt.Sprintf("bonuses:apply:%s", phone)
				rdb.Del(context.Background(), bonusKey)
			}

			if err := tx.Commit(context.Background()); err != nil {
				log.Printf("Ошибка фиксации транзакции: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проведения оплаты"})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"order_client_number": clientNumber,
			})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{"error": "Неизвестный статус оплаты"})
	})

}
