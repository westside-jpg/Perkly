package seed

import (
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func SetupSeeds(db *pgxpool.Pool) error {
	err := SeedCategories(db)
	if err != nil {
		log.Fatal("Ошибка добавления категорий товаров в БД (seed/categories.go)", err)
	}

	err = SeedExactProducts(db)
	if err != nil {
		log.Fatal("Ошибка добавления товаров в БД (seed/products.go)", err)
	}

	err = SeedOptions(db)
	if err != nil {
		log.Fatal("Ошибка добавления опций кастомизации в БД (seed/options.go)", err)
	}

	err = SeedProductsVariants(db)
	if err != nil {
		log.Fatal("Ошибка добавления вариантов товаров в БД (seed/product_variants.go)", err)
	}

	err = SeedProductOptions(db)
	if err != nil {
		log.Fatal("Ошибка связывания товаров и опций кастомизации в БД (seed/product_options.go)", err)
	}

	return nil
}
