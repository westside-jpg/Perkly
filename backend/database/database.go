package database

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

/*
Connect устанавливает пул соединений с PostgreSQL
по строке подключения и проверяет его через Ping.
При ошибке подключения завершает программу через log.Fatal,
так как без БД приложение не может работать
*/
func Connect(databaseURL string) *pgxpool.Pool {

	db, err := pgxpool.New(
		context.Background(),
		databaseURL,
	)

	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping(context.Background())

	if err != nil {
		log.Fatal(err)
	}

	return db
}

/*
CreateTables создаёт таблицы, если они ещё
не существуют. Безопасно вызывать при каждом запуске сервера,
существующие таблицы не затрагиваются (CREATE TABLE IF NOT EXISTS)
*/
func CreateTables(db *pgxpool.Pool) error {

	_, err := db.Exec(
		context.Background(),
		`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			phone TEXT UNIQUE NOT NULL,
			points INTEGER NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);

		CREATE TABLE IF NOT EXISTS categories (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			sort_order INTEGER NOT NULL DEFAULT 0
		);

		CREATE TABLE IF NOT EXISTS products (
			id SERIAL PRIMARY KEY,
			category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			description TEXT,
			image_url TEXT
		);

		CREATE TABLE IF NOT EXISTS product_variants (
			id SERIAL PRIMARY KEY,
			product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
			volume INTEGER NOT NULL,
			calories_base INTEGER NOT NULL,
			price_base INTEGER NOT NULL
		);

		CREATE TABLE IF NOT EXISTS options (
			id SERIAL PRIMARY KEY,
			"group" TEXT NOT NULL,
			name TEXT NOT NULL,
			volume INTEGER NOT NULL,
			unit TEXT NOT NULL,
			price_delta INTEGER NOT NULL,
			calories_delta INTEGER NOT NULL,
			image_url TEXT
		);

		CREATE TABLE IF NOT EXISTS product_options (
			product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
			option_id INTEGER NOT NULL REFERENCES options(id) ON DELETE CASCADE,
			PRIMARY KEY (product_id, option_id)
		);

		CREATE TABLE IF NOT EXISTS orders (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
			status TEXT NOT NULL DEFAULT 'pending',
			total_price INTEGER NOT NULL,
			total_calories INTEGER NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);

		CREATE TABLE IF NOT EXISTS order_items (
			id SERIAL PRIMARY KEY,
			order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
			product_variant_id INTEGER NOT NULL REFERENCES product_variants(id),
			quantity INTEGER NOT NULL,
			price_snapshot INTEGER NOT NULL,
			calories_snapshot INTEGER NOT NULL
		);

		CREATE TABLE IF NOT EXISTS order_item_options (
			order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
			option_id INTEGER NOT NULL REFERENCES options(id),
			quantity INTEGER NOT NULL,
			PRIMARY KEY (order_item_id, option_id)
		);

		CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
		CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
		CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
		`,
	)

	return err

}
