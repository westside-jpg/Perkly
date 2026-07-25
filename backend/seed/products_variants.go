package seed

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ProductVariant struct {
	ProductId    int
	Volume       int
	CaloriesBase int
	PriceBase    int
}

func SeedProductsVariants(db *pgxpool.Pool) error {
	variants := []ProductVariant{

		// 1 Эспрессо
		{ProductId: 1, Volume: 30, CaloriesBase: 5, PriceBase: 119},

		// 2 Двойной эспрессо
		{ProductId: 2, Volume: 60, CaloriesBase: 10, PriceBase: 169},

		// 3 Американо
		{ProductId: 3, Volume: 250, CaloriesBase: 5, PriceBase: 159},
		{ProductId: 3, Volume: 350, CaloriesBase: 10, PriceBase: 189},
		{ProductId: 3, Volume: 450, CaloriesBase: 10, PriceBase: 219},

		// 4 Капучино
		{ProductId: 4, Volume: 250, CaloriesBase: 130, PriceBase: 189},
		{ProductId: 4, Volume: 350, CaloriesBase: 180, PriceBase: 239},
		{ProductId: 4, Volume: 450, CaloriesBase: 230, PriceBase: 289},

		// 5 Латте
		{ProductId: 5, Volume: 250, CaloriesBase: 150, PriceBase: 219},
		{ProductId: 5, Volume: 350, CaloriesBase: 210, PriceBase: 269},
		{ProductId: 5, Volume: 450, CaloriesBase: 270, PriceBase: 319},

		// 6 Флэт Уайт
		{ProductId: 6, Volume: 250, CaloriesBase: 140, PriceBase: 229},
		{ProductId: 6, Volume: 350, CaloriesBase: 190, PriceBase: 279},
		{ProductId: 6, Volume: 450, CaloriesBase: 240, PriceBase: 329},

		// 7 Раф
		{ProductId: 7, Volume: 250, CaloriesBase: 260, PriceBase: 269},
		{ProductId: 7, Volume: 350, CaloriesBase: 340, PriceBase: 319},
		{ProductId: 7, Volume: 450, CaloriesBase: 420, PriceBase: 369},

		// 8 Мокка
		{ProductId: 8, Volume: 250, CaloriesBase: 240, PriceBase: 259},
		{ProductId: 8, Volume: 350, CaloriesBase: 320, PriceBase: 309},
		{ProductId: 8, Volume: 450, CaloriesBase: 390, PriceBase: 359},

		// 9 Макиато
		{ProductId: 9, Volume: 200, CaloriesBase: 80, PriceBase: 189},
		{ProductId: 9, Volume: 300, CaloriesBase: 120, PriceBase: 239},

		// 10 Айс Американо
		{ProductId: 10, Volume: 300, CaloriesBase: 5, PriceBase: 179},
		{ProductId: 10, Volume: 400, CaloriesBase: 10, PriceBase: 209},
		{ProductId: 10, Volume: 500, CaloriesBase: 10, PriceBase: 239},

		// 11 Айс Латте
		{ProductId: 11, Volume: 300, CaloriesBase: 140, PriceBase: 239},
		{ProductId: 11, Volume: 400, CaloriesBase: 190, PriceBase: 279},
		{ProductId: 11, Volume: 500, CaloriesBase: 240, PriceBase: 319},

		// 12 Айс Капучино
		{ProductId: 12, Volume: 300, CaloriesBase: 130, PriceBase: 229},
		{ProductId: 12, Volume: 400, CaloriesBase: 180, PriceBase: 269},
		{ProductId: 12, Volume: 500, CaloriesBase: 230, PriceBase: 309},

		// 13 Колд Брю
		{ProductId: 13, Volume: 300, CaloriesBase: 5, PriceBase: 239},
		{ProductId: 13, Volume: 400, CaloriesBase: 10, PriceBase: 269},
		{ProductId: 13, Volume: 500, CaloriesBase: 10, PriceBase: 299},

		// 14 Нитро Колд Брю
		{ProductId: 14, Volume: 300, CaloriesBase: 5, PriceBase: 279},
		{ProductId: 14, Volume: 400, CaloriesBase: 10, PriceBase: 319},
		{ProductId: 14, Volume: 500, CaloriesBase: 10, PriceBase: 359},

		// 15 Латте Солёная карамель
		{ProductId: 15, Volume: 250, CaloriesBase: 230, PriceBase: 289},
		{ProductId: 15, Volume: 350, CaloriesBase: 300, PriceBase: 339},
		{ProductId: 15, Volume: 450, CaloriesBase: 370, PriceBase: 389},

		// 16 Фисташковый Латте
		{ProductId: 16, Volume: 250, CaloriesBase: 250, PriceBase: 299},
		{ProductId: 16, Volume: 350, CaloriesBase: 320, PriceBase: 349},
		{ProductId: 16, Volume: 450, CaloriesBase: 390, PriceBase: 399},

		// 17 Кокосовый Латте
		{ProductId: 17, Volume: 250, CaloriesBase: 180, PriceBase: 289},
		{ProductId: 17, Volume: 350, CaloriesBase: 240, PriceBase: 339},
		{ProductId: 17, Volume: 450, CaloriesBase: 300, PriceBase: 389},

		// 18 Медовый Латте
		{ProductId: 18, Volume: 250, CaloriesBase: 210, PriceBase: 279},
		{ProductId: 18, Volume: 350, CaloriesBase: 280, PriceBase: 329},
		{ProductId: 18, Volume: 450, CaloriesBase: 350, PriceBase: 379},

		// 19 Лавандовый Латте
		{ProductId: 19, Volume: 250, CaloriesBase: 190, PriceBase: 279},
		{ProductId: 19, Volume: 350, CaloriesBase: 250, PriceBase: 329},
		{ProductId: 19, Volume: 450, CaloriesBase: 310, PriceBase: 379},

		// 20 Орео Латте
		{ProductId: 20, Volume: 250, CaloriesBase: 290, PriceBase: 309},
		{ProductId: 20, Volume: 350, CaloriesBase: 380, PriceBase: 359},
		{ProductId: 20, Volume: 450, CaloriesBase: 470, PriceBase: 409},

		// 21 Тирамису Латте
		{ProductId: 21, Volume: 250, CaloriesBase: 280, PriceBase: 309},
		{ProductId: 21, Volume: 350, CaloriesBase: 360, PriceBase: 359},
		{ProductId: 21, Volume: 450, CaloriesBase: 440, PriceBase: 409},

		// 22 Зелёный чай
		{ProductId: 22, Volume: 300, CaloriesBase: 0, PriceBase: 149},
		{ProductId: 22, Volume: 400, CaloriesBase: 0, PriceBase: 169},
		{ProductId: 22, Volume: 500, CaloriesBase: 0, PriceBase: 189},

		// 23 Чёрный чай
		{ProductId: 23, Volume: 300, CaloriesBase: 0, PriceBase: 149},
		{ProductId: 23, Volume: 400, CaloriesBase: 0, PriceBase: 169},
		{ProductId: 23, Volume: 500, CaloriesBase: 0, PriceBase: 189},

		// 24 Эрл Грей
		{ProductId: 24, Volume: 300, CaloriesBase: 0, PriceBase: 159},
		{ProductId: 24, Volume: 400, CaloriesBase: 0, PriceBase: 179},
		{ProductId: 24, Volume: 500, CaloriesBase: 0, PriceBase: 199},

		// 25 Матча Латте
		{ProductId: 25, Volume: 300, CaloriesBase: 160, PriceBase: 279},
		{ProductId: 25, Volume: 400, CaloriesBase: 220, PriceBase: 319},
		{ProductId: 25, Volume: 500, CaloriesBase: 280, PriceBase: 359},

		// 26 Айс Матча Латте
		{ProductId: 26, Volume: 300, CaloriesBase: 150, PriceBase: 289},
		{ProductId: 26, Volume: 400, CaloriesBase: 210, PriceBase: 329},
		{ProductId: 26, Volume: 500, CaloriesBase: 270, PriceBase: 369},

		// 27 Классический лимонад
		{ProductId: 27, Volume: 300, CaloriesBase: 90, PriceBase: 199},
		{ProductId: 27, Volume: 400, CaloriesBase: 120, PriceBase: 229},
		{ProductId: 27, Volume: 500, CaloriesBase: 150, PriceBase: 259},

		// 28 Клубничный лимонад
		{ProductId: 28, Volume: 300, CaloriesBase: 120, PriceBase: 229},
		{ProductId: 28, Volume: 400, CaloriesBase: 160, PriceBase: 249},
		{ProductId: 28, Volume: 500, CaloriesBase: 200, PriceBase: 279},

		// 29 Манговый лимонад
		{ProductId: 29, Volume: 300, CaloriesBase: 135, PriceBase: 239},
		{ProductId: 29, Volume: 400, CaloriesBase: 180, PriceBase: 259},
		{ProductId: 29, Volume: 500, CaloriesBase: 225, PriceBase: 289},

		// 30 Лимонад с маракуйей
		{ProductId: 30, Volume: 300, CaloriesBase: 130, PriceBase: 249},
		{ProductId: 30, Volume: 400, CaloriesBase: 170, PriceBase: 269},
		{ProductId: 30, Volume: 500, CaloriesBase: 210, PriceBase: 299},

		// 31 Блю Лагуна
		{ProductId: 31, Volume: 300, CaloriesBase: 110, PriceBase: 239},
		{ProductId: 31, Volume: 400, CaloriesBase: 150, PriceBase: 259},
		{ProductId: 31, Volume: 500, CaloriesBase: 190, PriceBase: 289},

		// 32 Мохито лимонад
		{ProductId: 32, Volume: 300, CaloriesBase: 80, PriceBase: 229},
		{ProductId: 32, Volume: 400, CaloriesBase: 100, PriceBase: 249},
		{ProductId: 32, Volume: 500, CaloriesBase: 125, PriceBase: 279},

		// 33 Клубничный рефрешер
		{ProductId: 33, Volume: 300, CaloriesBase: 90, PriceBase: 239},
		{ProductId: 33, Volume: 400, CaloriesBase: 120, PriceBase: 269},
		{ProductId: 33, Volume: 500, CaloriesBase: 150, PriceBase: 299},

		// 34 Манговый рефрешер
		{ProductId: 34, Volume: 300, CaloriesBase: 100, PriceBase: 249},
		{ProductId: 34, Volume: 400, CaloriesBase: 130, PriceBase: 279},
		{ProductId: 34, Volume: 500, CaloriesBase: 160, PriceBase: 309},

		// 35 Персиковый рефрешер
		{ProductId: 35, Volume: 300, CaloriesBase: 95, PriceBase: 239},
		{ProductId: 35, Volume: 400, CaloriesBase: 125, PriceBase: 269},
		{ProductId: 35, Volume: 500, CaloriesBase: 155, PriceBase: 299},

		// 36 Ягодный рефрешер
		{ProductId: 36, Volume: 300, CaloriesBase: 105, PriceBase: 249},
		{ProductId: 36, Volume: 400, CaloriesBase: 140, PriceBase: 279},
		{ProductId: 36, Volume: 500, CaloriesBase: 175, PriceBase: 309},

		// 37 Горячий шоколад
		{ProductId: 37, Volume: 250, CaloriesBase: 260, PriceBase: 259},
		{ProductId: 37, Volume: 350, CaloriesBase: 340, PriceBase: 309},
		{ProductId: 37, Volume: 450, CaloriesBase: 420, PriceBase: 359},

		// 38 Белый горячий шоколад
		{ProductId: 38, Volume: 250, CaloriesBase: 280, PriceBase: 269},
		{ProductId: 38, Volume: 350, CaloriesBase: 360, PriceBase: 319},
		{ProductId: 38, Volume: 450, CaloriesBase: 440, PriceBase: 369},

		// 39 Какао с маршмеллоу
		{ProductId: 39, Volume: 250, CaloriesBase: 220, PriceBase: 239},
		{ProductId: 39, Volume: 350, CaloriesBase: 290, PriceBase: 289},
		{ProductId: 39, Volume: 450, CaloriesBase: 360, PriceBase: 339},

		// 40 Чизкейк
		{ProductId: 40, Volume: 120, CaloriesBase: 420, PriceBase: 249},

		// 41 Брауни
		{ProductId: 41, Volume: 100, CaloriesBase: 350, PriceBase: 199},

		// 42 Круассан
		{ProductId: 42, Volume: 80, CaloriesBase: 260, PriceBase: 149},

		// 43 Маффин
		{ProductId: 43, Volume: 100, CaloriesBase: 320, PriceBase: 169},

		// 44 Печенье
		{ProductId: 44, Volume: 70, CaloriesBase: 280, PriceBase: 99},
	}

	for _, v := range variants {
		_, err := db.Exec(
			context.Background(),
			`INSERT INTO product_variants (product_id, volume, calories_base, price_base) VALUES ($1, $2, $3, $4)`,
			v.ProductId, v.Volume, v.CaloriesBase, v.PriceBase,
		)
		if err != nil {
			return err
		}
	}

	return nil
}
