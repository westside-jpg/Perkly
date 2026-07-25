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
}

func SeedOptions(db *pgxpool.Pool) error {
	options := []Option{
		{Group: "milk", Name: "Обычное (3,2%)", Volume: 0, Unit: "мл", PriceDelta: 0, CaloriesDelta: 0, ImageURL: "/images/options/milk/whole_milk.png"},
		{Group: "milk", Name: "Овсяное", Volume: 0, Unit: "мл", PriceDelta: 50, CaloriesDelta: -30, ImageURL: "/images/options/milk/oat_milk.png"},
		{Group: "milk", Name: "Миндальное", Volume: 0, Unit: "мл", PriceDelta: 60, CaloriesDelta: -100, ImageURL: "/images/options/milk/almond_milk.png"},
		{Group: "milk", Name: "Кокосовое", Volume: 0, Unit: "мл", PriceDelta: 60, CaloriesDelta: -80, ImageURL: "/images/options/milk/coconut_milk.png"},
		{Group: "milk", Name: "Соевое", Volume: 0, Unit: "мл", PriceDelta: 50, CaloriesDelta: -55, ImageURL: "/images/options/milk/soy_milk.png"},
		{Group: "milk", Name: "Безлактозное", Volume: 0, Unit: "мл", PriceDelta: 40, CaloriesDelta: -10, ImageURL: "/images/options/milk/lactose-free_milk.png"},

		{Group: "syrup", Name: "Ванильный", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 50, ImageURL: "/images/options/syrup/vanilla_syrup.png"},
		{Group: "syrup", Name: "Карамельный", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 55, ImageURL: "/images/options/syrup/caramel_syrup.png"},
		{Group: "syrup", Name: "Ореховый", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 55, ImageURL: "/images/options/syrup/hazelnut_syrup.png"},
		{Group: "syrup", Name: "Шоколадный", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 60, ImageURL: "/images/options/syrup/chocolate_syrup.png"},
		{Group: "syrup", Name: "Кокосовый", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 50, ImageURL: "/images/options/syrup/coconut_syrup.png"},
		{Group: "syrup", Name: "Фисташковый", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 60, ImageURL: "/images/options/syrup/pistachio_syrup.png"},
		{Group: "syrup", Name: "Лавандовый", Volume: 20, Unit: "мл", PriceDelta: 39, CaloriesDelta: 50, ImageURL: "/images/options/syrup/lavender_syrup.png"},

		{Group: "addon", Name: "Сахар", Volume: 4, Unit: "г", PriceDelta: 0, CaloriesDelta: 16, ImageURL: "/images/options/addon/sugar.png"},
		{Group: "addon", Name: "Лёд", Volume: 80, Unit: "г", PriceDelta: 0, CaloriesDelta: 0, ImageURL: "/images/options/addon/ice.png"},
		{Group: "addon", Name: "Шот эспрессо", Volume: 30, Unit: "мл", PriceDelta: 70, CaloriesDelta: 5, ImageURL: "/images/options/addon/extra_espresso_shot.png"},
		{Group: "addon", Name: "Взбитые сливки", Volume: 40, Unit: "г", PriceDelta: 60, CaloriesDelta: 120, ImageURL: "/images/options/addon/whipped_cream.png"},
		{Group: "addon", Name: "Корица", Volume: 2, Unit: "г", PriceDelta: 20, CaloriesDelta: 5, ImageURL: "/images/options/addon/cinnamon.png"},
		{Group: "addon", Name: "Маршмеллоу", Volume: 30, Unit: "г", PriceDelta: 50, CaloriesDelta: 100, ImageURL: "/images/options/addon/marshmallows.png"},
		{Group: "addon", Name: "Мёд", Volume: 20, Unit: "г", PriceDelta: 40, CaloriesDelta: 65, ImageURL: "/images/options/addon/honey.png"},
		{Group: "addon", Name: "Молочная пенка", Volume: 50, Unit: "г", PriceDelta: 30, CaloriesDelta: 20, ImageURL: "/images/options/addon/extra_foam.png"},
	}

	for _, o := range options {
		_, err := db.Exec(
			context.Background(),
			`INSERT INTO options ("group", name, volume, unit, price_delta, calories_delta, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			o.Group, o.Name, o.Volume, o.Unit, o.PriceDelta, o.CaloriesDelta, o.ImageURL,
		)
		if err != nil {
			return err
		}
	}

	return nil
}
