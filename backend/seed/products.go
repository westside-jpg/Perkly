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
	Description string
	ImageURL    string
}

func SeedExactProducts(db *pgxpool.Pool) error {
	products := []Product{
		// 1 — Классический кофе
		{CategoryID: 1, Name: "Эспрессо", Description: "Классический крепкий кофе с насыщенным вкусом, плотной пенкой крема и ярким ароматом свежемолотых зёрен", ImageURL: "/images/products/espresso.png"},
		{CategoryID: 1, Name: "Двойной эспрессо", Description: "Увеличенная порция эспрессо с более глубоким вкусом, насыщенным ароматом и высокой концентрацией кофе", ImageURL: "/images/products/espresso.png"},
		{CategoryID: 1, Name: "Американо", Description: "Классический кофейный напиток на основе эспрессо с добавлением горячей воды, мягким вкусом и лёгкими кофейными нотами", ImageURL: "/images/products/americano.png"},
		{CategoryID: 1, Name: "Капучино", Description: "Гармоничное сочетание насыщенного эспрессо, горячего молока и нежной молочной пены с бархатистой текстурой", ImageURL: "/images/products/cappuchino.png"},
		{CategoryID: 1, Name: "Латте", Description: "Нежный кофейный напиток с большим количеством молока, мягким вкусом эспрессо и лёгким сливочным послевкусием", ImageURL: "/images/products/latte.png"},
		{CategoryID: 1, Name: "Флэт Уайт", Description: "Насыщенный кофейный напиток с двойным эспрессо и тонким слоем шелковистой молочной пены", ImageURL: "/images/products/flat_white.png"},
		{CategoryID: 1, Name: "Раф", Description: "Сливочный кофейный напиток на основе эспрессо с нежной текстурой, молоком и сладкими ванильными нотками", ImageURL: "/images/products/raf_coffee.png"},
		{CategoryID: 1, Name: "Мокка", Description: "Кофейный напиток с сочетанием эспрессо, молока и шоколада с насыщенным десертным вкусом", ImageURL: "/images/products/mocha.png"},
		{CategoryID: 1, Name: "Макиато", Description: "Классический эспрессо с небольшим количеством молочной пены, сохраняющий яркий кофейный вкус и аромат", ImageURL: "/images/products/macchiato.png"},

		// 2 — Холодный кофе
		{CategoryID: 2, Name: "Айс Американо", Description: "Освежающий кофейный напиток на основе эспрессо с холодной водой и льдом, сохраняющий насыщенный вкус кофе", ImageURL: "/images/products/iced_americano.png"},
		{CategoryID: 2, Name: "Айс Латте", Description: "Холодный кофейный напиток с нежным молоком и льдом, обладающий мягким сливочным вкусом и лёгким ароматом кофе", ImageURL: "/images/products/iced_latte.png"},
		{CategoryID: 2, Name: "Айс Капучино", Description: "Освежающая версия классического капучино с холодным молоком и нежной воздушной пеной", ImageURL: "/images/products/iced_cappuchino.png"},
		{CategoryID: 2, Name: "Колд Брю", Description: "Кофе холодного заваривания с мягким вкусом, низкой кислотностью и насыщенным ароматом кофейных зёрен", ImageURL: "/images/products/cold_brew.png"},
		{CategoryID: 2, Name: "Нитро Колд Брю", Description: "Холодный кофе с бархатистой текстурой и нежной пенкой благодаря насыщению азотом", ImageURL: "/images/products/nitro_cold_brew.png"},

		// 3 — Авторские напитки
		{CategoryID: 3, Name: "Солёная карамель Латте", Description: "Нежный латте с карамельным сиропом и лёгкой солёной ноткой, создающей насыщенный сливочный вкус", ImageURL: "/images/products/salted_caramel_latte.png"},
		{CategoryID: 3, Name: "Фисташковый Латте", Description: "Сливочный кофейный напиток с нежным вкусом фисташки и мягким ореховым послевкусием", ImageURL: "/images/products/pistachio_latte.png"},
		{CategoryID: 3, Name: "Кокосовый Латте", Description: "Латте с кокосовым вкусом и лёгкими тропическими нотами, дополненный нежной молочной текстурой", ImageURL: "/images/products/coconut_latte.png"},
		{CategoryID: 3, Name: "Медовый Латте", Description: "Тёплый кофейный напиток с натуральным мёдом и ароматной корицей, создающий уютное сладкое послевкусие", ImageURL: "/images/products/honey_latte.png"},
		{CategoryID: 3, Name: "Лавандовый Латте", Description: "Нежный латте с лёгким цветочным ароматом лаванды и мягким сливочным вкусом", ImageURL: "/images/products/lavender_latte.png"},
		{CategoryID: 3, Name: "Орео Латте", Description: "Десертный кофейный напиток с шоколадным вкусом, молоком и кусочками печенья Oreo", ImageURL: "/images/products/oreo_latte.png"},
		{CategoryID: 3, Name: "Тирамису Латте", Description: "Кофейный напиток с нотами классического итальянского десерта тирамису, сливочным вкусом и ароматом кофе", ImageURL: "/images/products/tiramisu_latte.png"},

		// 4 — Чай и матча
		{CategoryID: 4, Name: "Зелёный чай", Description: "Лёгкий освежающий чай с мягким вкусом, травяными нотами и приятным ароматом", ImageURL: "/images/products/green_tea.png"},
		{CategoryID: 4, Name: "Чёрный чай", Description: "Классический чай с насыщенным вкусом, глубоким ароматом и лёгким терпким послевкусием", ImageURL: "/images/products/black_tea.png"},
		{CategoryID: 4, Name: "Эрл Грей", Description: "Чёрный чай с ароматом бергамота и лёгкими цитрусовыми нотами", ImageURL: "/images/products/earl_grey.png"},
		{CategoryID: 4, Name: "Матча Латте", Description: "Нежный напиток на основе японской матчи и молока с насыщенным зелёным вкусом и кремовой текстурой", ImageURL: "/images/products/matcha_latte.png"},
		{CategoryID: 4, Name: "Айс Матча Латте", Description: "Освежающий холодный напиток с японской матчей, молоком и льдом с мягким травяным вкусом", ImageURL: "/images/products/iced_matcha_latte.png"},

		// 5 — Лимонады
		{CategoryID: 5, Name: "Классический лимонад", Description: "Освежающий лимонад с ярким цитрусовым вкусом, лёгкой кислинкой и приятной сладостью", ImageURL: "/images/products/classic_lemonade.png"},
		{CategoryID: 5, Name: "Клубничный лимонад", Description: "Освежающий напиток с сочным вкусом спелой клубники, лёгкой кислинкой и ягодным ароматом", ImageURL: "/images/products/strawberry_limonade.png"},
		{CategoryID: 5, Name: "Манговый лимонад", Description: "Тропический лимонад с насыщенным вкусом спелого манго и освежающими цитрусовыми нотами", ImageURL: "/images/products/mango_limonade.png"},
		{CategoryID: 5, Name: "Лимонад с маракуйей", Description: "Фруктовый лимонад с ярким вкусом экзотической маракуйи и приятным кисло-сладким послевкусием", ImageURL: "/images/products/passion_fruit_lemonade.png"},
		{CategoryID: 5, Name: "Блю Лагуна", Description: "Яркий освежающий лимонад с тропическим вкусом и лёгкими цитрусовыми нотами", ImageURL: "/images/products/blue_lagoon.png"},
		{CategoryID: 5, Name: "Мохито лимонад", Description: "Освежающий лимонад с лаймом, мятой и лёгким кисло-сладким вкусом классического мохито", ImageURL: "/images/products/mojito_lemonade.png"},

		// 6 — Рефрешеры
		{CategoryID: 6, Name: "Клубничный рефрешер", Description: "Лёгкий фруктовый напиток с насыщенным вкусом клубники и освежающими ягодными нотами", ImageURL: "/images/products/strawberry_refresher.png"},
		{CategoryID: 6, Name: "Манговый рефрешер", Description: "Освежающий напиток с ярким тропическим вкусом манго и приятной фруктовой сладостью", ImageURL: "/images/products/mango_refresher.png"},
		{CategoryID: 6, Name: "Персиковый рефрешер", Description: "Нежный фруктовый напиток с мягким вкусом спелого персика и лёгким освежающим послевкусием", ImageURL: "/images/products/peach_refresher.png"},
		{CategoryID: 6, Name: "Ягодный рефрешер", Description: "Освежающий напиток с сочетанием лесных ягод и насыщенным фруктовым ароматом", ImageURL: "/images/products/berry_refresher.png"},

		// 7 — Горячий шоколад и какао
		{CategoryID: 7, Name: "Горячий шоколад", Description: "Насыщенный шоколадный напиток с нежной молочной текстурой и глубоким вкусом какао", ImageURL: "/images/products/hot_chocolate.png"},
		{CategoryID: 7, Name: "Белый горячий шоколад", Description: "Сливочный напиток на основе белого шоколада с мягким сладким вкусом и нежной текстурой", ImageURL: "/images/products/white_hot_chocolate.png"},
		{CategoryID: 7, Name: "Какао с маршмеллоу", Description: "Тёплое какао с воздушными маршмеллоу и насыщенным шоколадным ароматом", ImageURL: "/images/products/cocoa_with_marshmallows.png"},

		// 8 — Десерты
		{CategoryID: 8, Name: "Чизкейк", Description: "Нежный сливочный десерт с мягкой текстурой и насыщенным вкусом творожного сыра", ImageURL: "/images/products/cheesecake.png"},
		{CategoryID: 8, Name: "Брауни", Description: "Шоколадный десерт с плотной текстурой, насыщенным вкусом какао и мягкой серединой", ImageURL: "/images/products/brownie.png"},
		{CategoryID: 8, Name: "Круассан", Description: "Воздушная французская выпечка с хрустящей корочкой и нежным сливочным вкусом", ImageURL: "/images/products/croissant.png"},
		{CategoryID: 8, Name: "Маффин", Description: "Мягкая сладкая выпечка с нежной текстурой и приятным ароматом свежей сдобы", ImageURL: "/images/products/muffin.png"},
		{CategoryID: 8, Name: "Печенье", Description: "Хрустящее сладкое печенье с насыщенным вкусом, идеально подходящее к чашке кофе", ImageURL: "/images/products/cookie.png"},
	}

	for _, p := range products {
		_, err := db.Exec(
			context.Background(),
			`INSERT INTO products (category_id, name, description, image_url) VALUES ($1, $2, $3, $4)`,
			p.CategoryID, p.Name, p.Description, p.ImageURL,
		)
		if err != nil {
			return err
		}
	}

	return nil
}
