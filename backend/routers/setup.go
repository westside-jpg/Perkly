package routers

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func SetupRoutes(r *gin.Engine, db *pgxpool.Pool) {
	RegisterClientsRoutes(r, db)
	RegisterEmployeesRoutes(r, db)
}
