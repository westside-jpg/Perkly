package seed

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Option struct {
	Group         string
	Name          string
	Volume        int
	Unit          string
	PriceDelta    int
	CaloriesDelta int
	ImageURL      string
	SortOrder     int
}

func SeedOptions(db *pgxpool.Pool) error {
	options := []Option{
		{Group: "milk", Name: "Обычное (3,2%)", Volume: 0, Unit: "мл", PriceDelta: 0, CaloriesDelta: 0, ImageURL: "/options/milk/whole_milk.png", SortOrder: 1},
		{Group: "milk", Name: "Овсяное", Volume: 0, Unit: "мл", PriceDelta: 50, CaloriesDelta: -30, ImageURL: "/options/milk/oat_milk.png", SortOrder: 2},
		{Group: "milk", Name: "Миндальное", Volume: 0, Unit: "мл", PriceDelta: 60, CaloriesDelta: -100, ImageURL: "/options/milk/almond_milk.png", SortOrder: 3},
		{Group: "milk", Name: "Кокосовое", Volume: 0, Unit: "мл", PriceDelta: 60, CaloriesDelta: -80, ImageURL: "/options/milk/coconut_milk.png", SortOrder: 4},
		{Group: "milk", Name: "Соевое", Volume: 0, Unit: "мл", PriceDelta: 50, CaloriesDelta: -55, ImageURL: "/options/milk/soy_milk.png", SortOrder: 5},
		{Group: "milk", Name: "Безлактозное", Volume: 0, Unit: "мл", PriceDelta: 40, CaloriesDelta: -10, ImageURL: "/options/milk/lactose-free_milk.png", SortOrder: 6},

		{Group: "syrup", Name: "Ванильный", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 50, ImageURL: "/options/syrups/vanilla_syrup.png", SortOrder: 1},
		{Group: "syrup", Name: "Карамельный", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 55, ImageURL: "/options/syrups/caramel_syrup.png", SortOrder: 2},
		{Group: "syrup", Name: "Ореховый", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 55, ImageURL: "/options/syrups/hazelnut_syrup.png", SortOrder: 3},
		{Group: "syrup", Name: "Шоколадный", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 60, ImageURL: "/options/syrups/chocolate_syrup.png", SortOrder: 4},
		{Group: "syrup", Name: "Кокосовый", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 50, ImageURL: "/options/syrups/coconut_syrup.png", SortOrder: 5},
		{Group: "syrup", Name: "Фисташковый", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 60, ImageURL: "/options/syrups/pistachio_syrup.png", SortOrder: 6},
		{Group: "syrup", Name: "Лавандовый", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 50, ImageURL: "/options/syrups/lavender_syrup.png", SortOrder: 7},

		{Group: "addon", Name: "Сахар", Volume: 4, Unit: "г", PriceDelta: 0, CaloriesDelta: 16, ImageURL: "/options/addons/sugar.png", SortOrder: 1},
		{Group: "addon", Name: "Лёд", Volume: 80, Unit: "г", PriceDelta: 0, CaloriesDelta: 0, ImageURL: "/options/addons/ice.png", SortOrder: 2},
		{Group: "addon", Name: "Шот эспрессо", Volume: 30, Unit: "мл", PriceDelta: 70, CaloriesDelta: 5, ImageURL: "/options/addons/extra_espresso_shot.png", SortOrder: 3},
		{Group: "addon", Name: "Взбитые сливки", Volume: 40, Unit: "г", PriceDelta: 60, CaloriesDelta: 120, ImageURL: "/options/addons/whipped_cream.png", SortOrder: 4},
		{Group: "addon", Name: "Корица", Volume: 2, Unit: "г", PriceDelta: 20, CaloriesDelta: 5, ImageURL: "/options/addons/cinnamon.png", SortOrder: 5},
		{Group: "addon", Name: "Маршмеллоу", Volume: 30, Unit: "г", PriceDelta: 50, CaloriesDelta: 100, ImageURL: "/options/addons/marshmallows.png", SortOrder: 6},
		{Group: "addon", Name: "Мёд", Volume: 20, Unit: "г", PriceDelta: 40, CaloriesDelta: 65, ImageURL: "/options/addons/honey.png", SortOrder: 7},
		{Group: "addon", Name: "Молочная пенка", Volume: 50, Unit: "г", PriceDelta: 30, CaloriesDelta: 20, ImageURL: "/options/addons/extra_foam.png", SortOrder: 8},
	}

	for _, o := range options {
		_, err := db.Exec(
			context.Background(),
			`INSERT INTO options ("group", name, volume, unit, price_delta, calories_delta, image_url, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			o.Group, o.Name, o.Volume, o.Unit, o.PriceDelta, o.CaloriesDelta, o.ImageURL, o.SortOrder,
		)
		if err != nil {
			return err
		}
	}

	return nil
}
