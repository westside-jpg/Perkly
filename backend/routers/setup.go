package routers

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func SetupRoutes(r *gin.Engine, db *pgxpool.Pool, rdb *redis.Client) {
	RegisterClientsRoutes(r, db, rdb)
	RegisterEmployeesRoutes(r, db, rdb)
}
