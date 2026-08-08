package seed

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

func SeedProductOptions(db *pgxpool.Pool) error {
	// Какие имена опций доступны для каждой категории
	categoryOptions := map[int][]string{
		1: { // Базовый кофе
			"Обычное (3,2%)", "Овсяное", "Миндальное", "Кокосовое", "Соевое", "Безлактозное",
			"Ванильный", "Карамельный", "Ореховый", "Шоколадный", "Кокосовый", "Фисташковый", "Лавандовый",
			"Сахар", "Шот эспрессо", "Взбитые сливки", "Корица", "Маршмеллоу", "Мёд", "Молочная пенка",
		},
		2: { // Холодный кофе
			"Обычное (3,2%)", "Овсяное", "Миндальное", "Кокосовое", "Соевое", "Безлактозное",
			"Ванильный", "Карамельный", "Ореховый", "Шоколадный", "Кокосовый", "Фисташковый", "Лавандовый",
			"Сахар", "Лёд", "Шот эспрессо", "Взбитые сливки", "Мёд",
		},
		3: { // Авторские напитки
			"Обычное (3,2%)", "Овсяное", "Миндальное", "Кокосовое", "Соевое", "Безлактозное",
			"Ванильный", "Карамельный", "Ореховый", "Шоколадный", "Кокосовый", "Фисташковый", "Лавандовый",
			"Сахар", "Лёд", "Шот эспрессо", "Взбитые сливки", "Корица", "Маршмеллоу", "Мёд", "Молочная пенка",
		},
		4: { // Чай и матча
			"Сахар", "Лёд", "Мёд",
		},
		5: { // Лимонады
			"Ванильный", "Карамельный", "Ореховый", "Шоколадный", "Кокосовый", "Фисташковый", "Лавандовый",
			"Сахар", "Лёд",
		},
		6: { // Рефрешеры
			"Лёд",
		},
		7: { // Горячий шоколад и какао
			"Обычное (3,2%)", "Овсяное", "Миндальное", "Кокосовое", "Соевое", "Безлактозное",
			"Ванильный", "Карамельный", "Ореховый", "Шоколадный", "Кокосовый", "Фисташковый", "Лавандовый",
			"Сахар", "Лёд", "Взбитые сливки", "Маршмеллоу", "Корица", "Мёд",
		},
		8: {}, // Десерты без опций
	}

	for categoryID, optionNames := range categoryOptions {
		if len(optionNames) == 0 {
			continue
		}

		_, err := db.Exec(
			context.Background(),
			`INSERT INTO product_options (product_id, option_id)
			 SELECT products.id, options.id
			 FROM products
			 CROSS JOIN options
			 WHERE products.category_id = $1 AND options.name = ANY($2)`,
			categoryID, optionNames,
		)
		if err != nil {
			return err
		}
	}

	// У напитков ниже не показываем молоко в кастомизации
	productsWithoutMilk := []string{"Раф", "Эспрессо", "Двойной эспрессо", "Айс Американо",
	"Американо", "Колд Брю", "Нитро Колд Брю"}
	milkOptions := []string{"Обычное (3,2%)", "Овсяное", "Миндальное", "Кокосовое", "Соевое", "Безлактозное"}
	_, err := db.Exec(
		context.Background(),
		`DELETE FROM product_options
		WHERE product_id IN (SELECT id FROM products WHERE name = ANY($1))
		AND option_id IN (SELECT id FROM options WHERE name = ANY($2))`,
		productsWithoutMilk, milkOptions,
	)
	if err != nil {
		return err
	}

	// Матча Латте (+Айс) по факту латте, добавляем молоко и сиропы поверх базового набора чая
	matchaExtras := []string{
		"Обычное (3,2%)", "Овсяное", "Миндальное", "Кокосовое", "Соевое", "Безлактозное",
		"Ванильный", "Карамельный", "Ореховый", "Шоколадный", "Кокосовый", "Фисташковый", "Лавандовый",
	}
	matchaProducts := []string{"Матча Латте", "Айс Матча Латте"}

	_, err = db.Exec(
		context.Background(),
		`INSERT INTO product_options (product_id, option_id)
		 SELECT products.id, options.id FROM products
		 CROSS JOIN options
		 WHERE products.name = ANY($1) AND options.name = ANY($2)`,
		matchaProducts, matchaExtras,
	)
	if err != nil {
		return err
	}

	return nil
}
