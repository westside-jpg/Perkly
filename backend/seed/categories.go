package seed

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Category struct {
	Name      string
	SortOrder int
}

func SeedCategories(db *pgxpool.Pool) error {
	categories := []Category{
		{Name: "Классический кофе", SortOrder: 1},
		{Name: "Холодный кофе", SortOrder: 2},
		{Name: "Авторские напитки", SortOrder: 3},
		{Name: "Чай и матча", SortOrder: 4},
		{Name: "Лимонады", SortOrder: 5},
		{Name: "Рефрешеры", SortOrder: 6},
		{Name: "Горячий шоколад", SortOrder: 7},
		{Name: "Десерты", SortOrder: 8},
	}

	for _, c := range categories {
		_, err := db.Exec(
			context.Background(),
			`INSERT INTO categories (name, sort_order) VALUES ($1, $2)`,
			c.Name, c.SortOrder,
		)
		if err != nil {
			return err
		}
	}

	return nil
}
