package seed

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

/*

   Категории:
   1 - Классический кофе
   2 - Холодный кофе
   3 - Авторские напитки
   4 - Чай и матча
   5 - Лимонады
   6 - Рефрешеры
   7 - Горячий шоколад
   8 - Десерты

*/

type Product struct {
	CategoryID  int
	Name        string
	Unit        string
	Description string
	ImageURL    string
}

func SeedExactProducts(db *pgxpool.Pool) error {
	products := []Product{
		// 1 — Базовый кофе
		{CategoryID: 1, Name: "Эспрессо", Unit: "мл", Description: "Классический крепкий кофе с насыщенным вкусом, плотной пенкой крема и ярким ароматом свежемолотых зёрен", ImageURL: "/products/espresso.png"},
		{CategoryID: 1, Name: "Двойной эспрессо", Unit: "мл", Description: "Увеличенная порция эспрессо с более глубоким вкусом, насыщенным ароматом и высокой концентрацией кофе", ImageURL: "/products/espresso.png"},
		{CategoryID: 1, Name: "Американо", Unit: "мл", Description: "Классический кофейный напиток на основе эспрессо с добавлением горячей воды, мягким вкусом и лёгкими кофейными нотами", ImageURL: "/products/americano.png"},
		{CategoryID: 1, Name: "Капучино", Unit: "мл", Description: "Гармоничное сочетание насыщенного эспрессо, горячего молока и нежной молочной пены с бархатистой текстурой", ImageURL: "/products/cappuchino.png"},
		{CategoryID: 1, Name: "Латте", Unit: "мл", Description: "Нежный кофейный напиток с большим количеством молока, мягким вкусом эспрессо и лёгким сливочным послевкусием", ImageURL: "/products/latte.png"},
		{CategoryID: 1, Name: "Флэт Уайт", Unit: "мл", Description: "Насыщенный кофейный напиток с двойным эспрессо и тонким слоем шелковистой молочной пены", ImageURL: "/products/flat_white.png"},
		{CategoryID: 1, Name: "Раф", Unit: "мл", Description: "Сливочный кофейный напиток на основе эспрессо с нежной текстурой, молоком и сладкими ванильными нотками", ImageURL: "/products/raf_coffee.png"},
		{CategoryID: 1, Name: "Мокка", Unit: "мл", Description: "Кофейный напиток с сочетанием эспрессо, молока и шоколада с насыщенным десертным вкусом", ImageURL: "/products/mocha.png"},
		{CategoryID: 1, Name: "Макиато", Unit: "мл", Description: "Классический эспрессо с небольшим количеством молочной пены, сохраняющий яркий кофейный вкус и аромат", ImageURL: "/products/macchiato.png"},

		// 2 — Холодный кофе
		{CategoryID: 2, Name: "Айс Американо", Unit: "мл", Description: "Освежающий кофейный напиток на основе эспрессо с холодной водой и льдом, сохраняющий насыщенный вкус кофе", ImageURL: "/products/iced_americano.png"},
		{CategoryID: 2, Name: "Айс Латте", Unit: "мл", Description: "Холодный кофейный напиток с нежным молоком и льдом, обладающий мягким сливочным вкусом и лёгким ароматом кофе", ImageURL: "/products/iced_latte.png"},
		{CategoryID: 2, Name: "Айс Капучино", Unit: "мл", Description: "Освежающая версия классического капучино с холодным молоком и нежной воздушной пеной", ImageURL: "/products/iced_cappuchino.png"},
		{CategoryID: 2, Name: "Колд Брю", Unit: "мл", Description: "Кофе холодного заваривания с мягким вкусом, низкой кислотностью и насыщенным ароматом кофейных зёрен", ImageURL: "/products/cold_brew.png"},
		{CategoryID: 2, Name: "Нитро Колд Брю", Unit: "мл", Description: "Холодный кофе с бархатистой текстурой и нежной пенкой благодаря насыщению азотом", ImageURL: "/products/nitro_cold_brew.png"},

		// 3 — Авторские напитки
		{CategoryID: 3, Name: "Латте Солёная карамель", Unit: "мл", Description: "Нежный латте с карамельным сиропом и лёгкой солёной ноткой, создающей насыщенный сливочный вкус", ImageURL: "/products/salted_caramel_latte.png"},
		{CategoryID: 3, Name: "Фисташковый Латте", Unit: "мл", Description: "Сливочный кофейный напиток с нежным вкусом фисташки и мягким ореховым послевкусием", ImageURL: "/products/pistachio_latte.png"},
		{CategoryID: 3, Name: "Кокосовый Латте", Unit: "мл", Description: "Латте с кокосовым вкусом и лёгкими тропическими нотами, дополненный нежной молочной текстурой", ImageURL: "/products/coconut_latte.png"},
		{CategoryID: 3, Name: "Медовый Латте", Unit: "мл", Description: "Тёплый кофейный напиток с натуральным мёдом и ароматной корицей, создающий уютное сладкое послевкусие", ImageURL: "/products/honey_latte.png"},
		{CategoryID: 3, Name: "Лавандовый Латте", Unit: "мл", Description: "Нежный латте с лёгким цветочным ароматом лаванды и мягким сливочным вкусом", ImageURL: "/products/lavender_latte.png"},
		{CategoryID: 3, Name: "Орео Латте", Unit: "мл", Description: "Десертный кофейный напиток с шоколадным вкусом, молоком и кусочками печенья Oreo", ImageURL: "/products/oreo_latte.png"},
		{CategoryID: 3, Name: "Тирамису Латте", Unit: "мл", Description: "Кофейный напиток с нотами классического итальянского десерта тирамису, сливочным вкусом и ароматом кофе", ImageURL: "/products/tiramisu_latte.png"},

		// 4 — Чай и матча
		{CategoryID: 4, Name: "Зелёный чай", Unit: "мл", Description: "Лёгкий освежающий чай с мягким вкусом, травяными нотами и приятным ароматом", ImageURL: "/products/green_tea.png"},
		{CategoryID: 4, Name: "Чёрный чай", Unit: "мл", Description: "Классический чай с насыщенным вкусом, глубоким ароматом и лёгким терпким послевкусием", ImageURL: "/products/black_tea.png"},
		{CategoryID: 4, Name: "Эрл Грей", Unit: "мл", Description: "Чёрный чай с ароматом бергамота и лёгкими цитрусовыми нотами", ImageURL: "/products/earl_grey.png"},
		{CategoryID: 4, Name: "Матча Латте", Unit: "мл", Description: "Нежный напиток на основе японской матчи и молока с насыщенным зелёным вкусом и кремовой текстурой", ImageURL: "/products/matcha_latte.png"},
		{CategoryID: 4, Name: "Айс Матча Латте", Unit: "мл", Description: "Освежающий холодный напиток с японской матчей, молоком и льдом с мягким травяным вкусом", ImageURL: "/products/iced_matcha_latte.png"},

		// 5 — Лимонады
		{CategoryID: 5, Name: "Классический лимонад", Unit: "мл", Description: "Освежающий лимонад с ярким цитрусовым вкусом, лёгкой кислинкой и приятной сладостью", ImageURL: "/products/classic_lemonade.png"},
		{CategoryID: 5, Name: "Клубничный лимонад", Unit: "мл", Description: "Освежающий напиток с сочным вкусом спелой клубники, лёгкой кислинкой и ягодным ароматом", ImageURL: "/products/strawberry_lemonade.png"},
		{CategoryID: 5, Name: "Манговый лимонад", Unit: "мл", Description: "Тропический лимонад с насыщенным вкусом спелого манго и освежающими цитрусовыми нотами", ImageURL: "/products/mango_lemonade.png"},
		{CategoryID: 5, Name: "Лимонад с маракуйей", Unit: "мл", Description: "Фруктовый лимонад с ярким вкусом экзотической маракуйи и приятным кисло-сладким послевкусием", ImageURL: "/products/passion_fruit_lemonade.png"},
		{CategoryID: 5, Name: "Блю Лагуна", Unit: "мл", Description: "Яркий освежающий лимонад с тропическим вкусом и лёгкими цитрусовыми нотами", ImageURL: "/products/blue_lagoon.png"},
		{CategoryID: 5, Name: "Мохито", Unit: "мл", Description: "Освежающий лимонад с лаймом, мятой и лёгким кисло-сладким вкусом классического мохито", ImageURL: "/products/mojito_lemonade.png"},

		// 6 — Рефрешеры
		{CategoryID: 6, Name: "Клубничный рефрешер", Unit: "мл", Description: "Лёгкий фруктовый напиток с насыщенным вкусом клубники и освежающими ягодными нотами", ImageURL: "/products/strawberry_refresher.png"},
		{CategoryID: 6, Name: "Манговый рефрешер", Unit: "мл", Description: "Освежающий напиток с ярким тропическим вкусом манго и приятной фруктовой сладостью", ImageURL: "/products/mango_refresher.png"},
		{CategoryID: 6, Name: "Персиковый рефрешер", Unit: "мл", Description: "Нежный фруктовый напиток с мягким вкусом спелого персика и лёгким освежающим послевкусием", ImageURL: "/products/peach_refresher.png"},
		{CategoryID: 6, Name: "Ягодный рефрешер", Unit: "мл", Description: "Освежающий напиток с сочетанием лесных ягод и насыщенным фруктовым ароматом", ImageURL: "/products/berry_refresher.png"},

		// 7 — Горячий шоколад
		{CategoryID: 7, Name: "Горячий шоколад", Unit: "мл", Description: "Насыщенный шоколадный напиток с нежной молочной текстурой и глубоким вкусом какао", ImageURL: "/products/hot_chocolate.png"},
		{CategoryID: 7, Name: "Белый горячий шоколад", Unit: "мл", Description: "Сливочный напиток на основе белого шоколада с мягким сладким вкусом и нежной текстурой", ImageURL: "/products/white_hot_chocolate.png"},
		{CategoryID: 7, Name: "Какао с маршмеллоу", Unit: "мл", Description: "Тёплое какао с воздушными маршмеллоу и насыщенным шоколадным ароматом", ImageURL: "/products/cocoa_with_marshmallows.png"},

		// 8 — Десерты
		{CategoryID: 8, Name: "Чизкейк", Unit: "г", Description: "Нежный сливочный десерт с мягкой текстурой и насыщенным вкусом творожного сыра", ImageURL: "/products/cheesecake.png"},
		{CategoryID: 8, Name: "Брауни", Unit: "г", Description: "Шоколадный десерт с плотной текстурой, насыщенным вкусом какао и мягкой серединой", ImageURL: "/products/brownie.png"},
		{CategoryID: 8, Name: "Круассан", Unit: "г", Description: "Воздушная французская выпечка с хрустящей корочкой и нежным сливочным вкусом", ImageURL: "/products/croissant.png"},
		{CategoryID: 8, Name: "Маффин", Unit: "г", Description: "Мягкая сладкая выпечка с нежной текстурой и приятным ароматом свежей сдобы", ImageURL: "/products/muffin.png"},
		{CategoryID: 8, Name: "Печенье", Unit: "г", Description: "Хрустящее сладкое печенье с насыщенным вкусом, идеально подходящее к чашке кофе", ImageURL: "/products/cookie.png"},
	}

	for _, p := range products {
		_, err := db.Exec(
			context.Background(),
			`INSERT INTO products (category_id, name, unit, description, image_url) VALUES ($1, $2, $3, $4, $5)`,
			p.CategoryID, p.Name, p.Unit, p.Description, p.ImageURL,
		)
		if err != nil {
			return err
		}
	}

	return nil
}
