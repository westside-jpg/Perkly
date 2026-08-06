package routers

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type  struct {

}

type GetActiveOrders struct {
	
}

func RegisterEmployeesRoutes(r *gin.Engine, db *pgxpool.Pool, rdb *redis.Client) {
	r.GET("/api/barista/get-active-orders", func(c *gin.Context) {

	})
}
