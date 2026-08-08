<div align="center">

<div align="center">

<img src="docs/logo.svg" width="60%">

</div>

Веб-приложение для киоска самообслуживания в кофейне: каталог напитков, кастомизация, корзина, бонусная программа, оплата и панель бариста

![Go](https://img.shields.io/badge/Go-1.26-00ADD8?logo=go&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-ready-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-ready-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

</div>

---

Fullstack PET-проект на Go и React. На создание проекта вдохновила московская сеть кофеен "Дринкит", в которую я зашел, когда находился в Москве. Понравилась идея самообслуживания, заточенная на iPad'ы с user-friendly дизайном. Задача была собрать киоск с полным циклом заказа, от экрана ожидания до панели бариста, без лишней абстракции ради масштаба учебного проекта

## Скриншоты и GIF

### Экран ожидания

<div align="center">

<img src="docs/screensaver.png" width="60%">

</div>

---

### Каталог

<div align="center">

<img src="docs/catalog.gif" width="60%">

</div>

---

### Кастомизация напитка

<div align="center">

<img src="docs/customization.gif" width="60%">

</div>

---

### Экран бездействия

<div align="center">

<img src="docs/inactivity.png" width="60%">


</div>

---

### Корзина и бонусы

<div align="center">

<img src="docs/cart.png" width="49%">
<img src="docs/sms.png" width="49%">


</div>

---

### Оплата

<div align="center">

<img src="docs/payment-1.png" width="49%">
<img src="docs/payment-2.png" width="49%">

</div>

---

### Панель бариста

<div align="center">

<img src="docs/barista.png" width="60%">

</div>

## Оглавление

- [Возможности](#возможности)
- [Стек технологий](#стек-технологий)
- [Быстрый старт через Docker](#быстрый-старт-через-docker)
- [Запуск без Docker](#запуск-без-docker)
- [Просмотр базы данных](#просмотр-базы-данных)
- [Переменные окружения](#переменные-окружения)
- [API](#api)
- [Схема базы данных и ER-диаграмма](#схема-базы-данных-и-er-диаграмма)
- [Структура проекта](#структура-проекта)
- [UI/UX решения](#uiux-решения)
- [Архитектурные решения](#архитектурные-решения)
- [Лицензии и атрибуция](#лицензии-и-атрибуция)

## Возможности

### Каталог и заказ

| Функция | Описание |
|---|---|
| Экран ожидания | Заставка киоска, переход в каталог по касанию |
| Каталог напитков | Категории с горизонтальными вкладками и scroll-spy при прокрутке |
| Карточки товаров | Цена «от», минимальный объём и калории, тень под фото через отдельный blur-элемент |
| Кастомизация | Выбор объёма, молока, сиропов и добавок с пересчётом цены и калорий |
| Корзина | Список позиций, удаление с анимацией, итоговая сумма |
| Бездействие | Предупреждение через 45 секунд бездействия, полный сброс сессии через 15 секунд после предупреждения |

### Бонусная программа

| Функция | Описание |
|---|---|
| Регистрация по телефону | Шестизначный SMS-код в Redis, в dev-режиме код пишется в консоль backend |
| Вход по телефону | Проверка номера и получение текущего баланса бонусов |
| Списание бонусов | Отдельная верификация по SMS перед checkout, флаг подтверждения хранится в Redis 15 минут |
| Начисление | 10% от суммы к оплате после успешной оплаты |
| Стартовый баланс | 200 бонусов при регистрации |

### Оплата

| Функция | Описание |
|---|---|
| Checkout | Сервер пересчитывает корзину, создаёт черновик заказа и возвращает `order_uuid` с итоговой суммой |
| Карта и СБП | Два экрана оплаты с мок-терминалом |
| Успех и отказ | Тестовые кнопки оплаты отправляют статус на backend без реальной интеграции |
| Номер заказа | Трёхзначный клиентский номер 100–999 после успешной оплаты |

### Панель бариста

| Функция | Описание |
|---|---|
| Маршрут `/barista` | Отдельный экран в том же React SPA |
| Список заказов | Заказы со статусом `paid`, обновление polling'ом раз в 5 секунд |
| Срочность | Цвет карточки меняется по времени ожидания. До 10 мин (зеленый), 10–15 мин (желтый), больше 15 мин (красный) |
| Две колонки | Распределение заказов по высоте содержимого |
| Готовность | Кнопка завершения заказа, статус меняется на `done` |

## Стек технологий

| Слой | Технологии |
|---|---|
| Backend | Go 1.26, Gin, PostgreSQL, pgx / pgxpool, Redis (go-redis), google/uuid, godotenv |
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 4 (@tailwindcss/vite), React Router 7, Framer Motion, Sonner, canvas-confetti |
| Инфраструктура | Docker, Docker Compose |

## Быстрый старт через Docker

Понадобится установленный [Docker Desktop](https://www.docker.com/products/docker-desktop/), он включает в себя Docker и Docker Compose

**1. Клонирование репозитория**

```bash
git clone https://github.com/westside-jpg/Perkly.git
cd Perkly
```

**2. Настройка переменных окружения**

```bash
cp .env.example .env
```

Значения переменных описаны в разделе [Переменные окружения](#переменные-окружения) ниже

**3. Запуск backend, PostgreSQL и Redis**

```bash
docker compose up --build
```

При первом запуске backend пересоздаст таблицы и наполнит меню сидерами. API станет доступен на `http://localhost:8080`

**4. Запуск frontend**

Frontend не включён в Docker Compose намеренно, подробнее об этом в разделе [Архитектурные решения](#архитектурные-решения)

```bash
cd frontend
npm install
npm run dev
```

Киоск откроется на `http://localhost:5173`, панель бариста на `http://localhost:5173/barista`

**Остановка**

```bash
docker compose down        # остановить контейнеры
docker compose down -v     # остановить и удалить данные базы
```

**Последующий запуск, если файлы не менялись**

```bash
docker compose up
```

> ⚠️ При каждом перезапуске backend все таблицы удаляются и создаются заново (`DropTables` в `main.go`). Это удобно для разработки, но не предназначено для продакшена

## Запуск без Docker

**Требования:** Go 1.26+, Node.js, локально установленные PostgreSQL и Redis

**1. Клонирование и настройка `.env`**

```bash
git clone https://github.com/westside-jpg/Perkly.git
cd Perkly
cp .env.example .env
```

В `.env` нужно указать `DATABASE_URL` и `REDIS_ADDR` с хостом `localhost`, например

```env
DATABASE_URL=postgres://perkly:perkly@localhost:5432/perkly?sslmode=disable
REDIS_ADDR=localhost:6379
```

**2. Подготовка PostgreSQL**

```bash
createdb perkly
```

**3. Запуск Redis**

```bash
redis-server
```

**4. Запуск backend**

```bash
cd backend
go run .
```

**5. Запуск frontend**

```bash
cd frontend
npm install
npm run dev
```

## Просмотр базы данных

После запуска через Docker PostgreSQL доступен на `localhost:5433`

```bash
docker compose exec postgres psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```

Где  
`<POSTGRES_USER>` - значение POSTGRES_USER из `.env`  
`<POSTGRES_DB>` - значение POSTGRES_DB из `.env`

При запуске без Docker

```bash
psql "<DATABASE_URL>"
```

## Переменные окружения

Все настройки хранятся в одном файле `.env` в корне проекта. Он используется и докером, и сервером при запуске без докера

```bash
cp .env.example .env
```

| Переменная | Назначение |
|---|---|
| `POSTGRES_USER` | Имя пользователя PostgreSQL внутри Docker |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL внутри Docker |
| `POSTGRES_DB` | Имя базы данных внутри Docker |
| `DATABASE_URL` | Строка подключения к локальному PostgreSQL, нужна только для запуска без Docker |
| `REDIS_ADDR` | Адрес Redis. В Docker compose подставляет `redis:6379`, локально по умолчанию `localhost:6379` |
| `REDIS_PASSWORD` | Пароль Redis, если не нужен, то оставить пустым |
| `REDIS_DB` | Номер базы Redis, по умолчанию `0` |

При запуске через Docker используются `POSTGRES_*`, из них `docker-compose.yml` сам собирает `DATABASE_URL` и `REDIS_ADDR` для контейнера backend. При запуске без Docker нужны `DATABASE_URL` и `REDIS_ADDR` с `localhost`. Оба варианта могут жить в одном `.env` одновременно

## API

### Каталог

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/get-products-and-categories` | Список продуктов с MIN(price_base), MIN(volume), MIN(calories_base) для карточек каталога |
| GET | `/api/get-product-information/:id` | Продукт, все варианты объёма и доступные опции |

### Пользователь и бонусы

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/user/login` | Проверка номера телефона, возвращает баланс бонусов |
| POST | `/api/user/start-registration` | Отправка SMS-кода для регистрации, rate limit 1 минута |
| POST | `/api/user/verify-registration` | Подтверждение кода и создание пользователя |
| POST | `/api/user/start-verification` | SMS-код для подтверждения списания бонусов |
| POST | `/api/user/verify` | Подтверждение списания, возвращает баланс |
| POST | `/api/user/verify/cancel` | Отмена подтверждённого списания бонусов |

### Заказ и оплата

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/order/checkout` | Создание заказа из корзины, расчёт бонусов, возврат `order_uuid` и `final_price` |
| POST | `/api/order/pay` | Мок-оплата: `method` (`card` / `sbp`), `status` (`approved` / `declined`) |

### Бариста

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/barista/get-new-orders` | Список оплаченных заказов со составом |
| POST | `/api/barista/order-ready` | Отметить заказ готовым |

## Схема базы данных и ER-диаграмма

### Схема
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    bonuses INTEGER NOT NULL DEFAULT 200,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    description TEXT,
    image_url TEXT
);

CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    volume INTEGER NOT NULL,
    calories_base INTEGER NOT NULL,
    price_base INTEGER NOT NULL
);

CREATE TABLE options (
    id SERIAL PRIMARY KEY,
    "group" TEXT NOT NULL,          -- 'milk' | 'syrup' | 'addon'
    name TEXT NOT NULL,
    volume INTEGER NOT NULL,
    unit TEXT NOT NULL,
    price_delta INTEGER NOT NULL,
    calories_delta INTEGER NOT NULL,
    image_url TEXT,
    sort_order INTEGER NOT NULL
);

CREATE TABLE product_options (
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    option_id INTEGER NOT NULL REFERENCES options(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, option_id)
);

CREATE SEQUENCE order_client_number_seq
    START WITH 100 INCREMENT BY 1 MINVALUE 100 MAXVALUE 999 CYCLE;

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_uuid TEXT NOT NULL UNIQUE,
    user_id INTEGER DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
    order_client_number TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',     -- pending | paid | cancelled | done
    total_price INTEGER NOT NULL,
    bonuses_used INTEGER NOT NULL DEFAULT 0,
    final_price INTEGER NOT NULL,
    bonuses_accrued INTEGER NOT NULL DEFAULT 0,
    payment_method TEXT CHECK (payment_method IN ('card', 'sbp')),
    payment_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_variant_id INTEGER NOT NULL REFERENCES product_variants(id),
    price_snapshot INTEGER NOT NULL
);

CREATE TABLE order_item_options (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    option_id INTEGER NOT NULL REFERENCES options(id),
    price_snapshot INTEGER NOT NULL DEFAULT 0
);
```

### ER-диаграмма

<div align="center">

<img src="docs/ER.png" width="70%">

</div>

## Структура проекта

```
Perkly/
├── docker-compose.yml          # postgres + redis + backend
├── .env.example                # Пример переменных окружения
├── .gitignore
├── LICENSE                     # Лицензия
├── README.md                   # Ридми
├── docs/                       # Скриншоты для README
│
├── backend/
│   ├── Dockerfile              # Сборка Go-приложения в контейнер
│   ├── main.go                 # Точка входа, CORS, подключение БД и Redis
│   ├── go.mod
│   ├── go.sum
│   ├── config/
│   │   └── config.go           # Загрузка переменных из .env
│   ├── database/
│   │   └── database.go         # PostgreSQL, Redis, CREATE/DROP таблиц
│   ├── routers/
│   │   ├── setup.go            # Регистрация роутов
│   │   ├── clients.go          # API самого киоска. Каталог, пользователи, checkout, оплата
│   │   └── employees.go        # API панели бариста
│   ├── seed/
│   │   ├── setup.go            # Оркестрация сидирования
│   │   ├── categories.go       # 8 категорий меню
│   │   ├── products.go         # Продукты и описания
│   │   ├── product_variants.go # Объёмы, цены, калории
│   │   ├── options.go          # Молоко, сиропы, добавки
│   │   └── product_options.go  # Связи продукт ↔ опции + ручные исключения
│   └── utils/
│       └── declination.go      # Склонение слов для сообщений об ошибках
│
└── frontend/
    ├── package.json
    ├── vite.config.ts          # Vite + React + Tailwind CSS v4
    ├── index.html
    ├── public/
    │   ├── Manrope.ttf         # Шрифт интерфейса
    │   ├── elements/           # SVG-иконки (назад, корзина, оплата и т.д.)
    │   ├── products/           # Фото напитков
    │   ├── options/            # Фото опций кастомизации
    │   └── screensaver/        # Промо-фото для скринсейвера
    └── src/
        ├── main.tsx            # Точка входа React
        ├── MainRouter.tsx      # Маршруты / и /barista
        ├── App.tsx             # Киоск: каталог, корзина, checkout, оплата
        ├── BaristaScreen.tsx   # Панель бариста
        ├── KioskFrame.tsx      # Фиксированный экран 820×1180 с scale()
        ├── index.css           # Tailwind, @font-face Manrope
        ├── types.ts            # Общие TypeScript-типы
        ├── utils/
        │   └── declination.ts  # Склонение на фронте
        ├── components/
        │   ├── CategoriesTabs.tsx       # Горизонтальные вкладки категорий
        │   ├── ProductCard.tsx          # Карточка товара в каталоге
        │   ├── CustomizationPopUp.tsx   # Конструктор напитка
        │   ├── MilkChooser.tsx          # Компонент выбора молока в кастомизации
        │   ├── SyrupAndAddonChooser.tsx # Компонент выбора сиропа/добавки в кастомизации
        │   ├── Keypad.tsx               # Цифровая клавиатура для ввода номера и кода
        │   ├── BonusEnter.tsx           # Модалка для ввода номера (вход в бонусную систему)
        │   ├── BonusRegistration.tsx    # Модалка для регистрации в бонусной системе
        │   ├── BonusVerification.tsx    # Верификация номера для бонусной ситемы
        │   └── InactivityModal.tsx      # Модалка для экрана бездействия
        └── pages/
            ├── Screensaver.tsx          # Скринсейвер с промо-фото
            ├── Cart.tsx                 # Корзина
            ├── Checkout.tsx             # Чекаут с выбором метода оплаты
            ├── MethodCard.tsx           # Оплата картой
            ├── MethodSBP.tsx            # Оплата СБП
            ├── Approved.tsx             # Страница успешной оплаты
            └── Declined.tsx             # Страница неудачной оплаты
```

## UI/UX решения

> 📁 В директории `figma_mockups` лежат оригинальные макеты, с которых начиналась верстка. Глобальная концепция дошла до финала, но в процессе написания кода интерфейс немного допиливался и адаптировался под реальные нужды. Если интересно заглянуть за кулисы и посмотреть, как эволюционировал дизайн от первоначальной задумки до итогового результата (глобальная стилистика не изменилась), то исходники открыты для изучения :)

**Строгий минимализм и монохромная гамма**  
Основной интерфейс киоска выполнен в строгой черно-белой палитре с оттенками серого. Чистый белый фон и черные надписи без лишнего визуального шума позволяют акцентировать всё внимание гостя на фотографиях продукции

**Динамическая индикация SLA для бариста**  
Чтобы бариста не вчитывался во время каждого нового чека, карточки заказов автоматически меняют цветовую схему в зависимости от времени ожидания: до 10 минут - пастельно-зеленая, 10–15 минут - жёлто-янтарная, больше 15 минут - приглушенно-красная. Цвета подобраны в единой приглушенной тональности, чтобы не резать глаз при долгой работе

**Плавные Mount/Unmount страниц и компонентов**  
Переключение страниц интерфейса не происходит мгновенно (что часто дезориентирует). Настроена задержка в 150мс между переключениями. Также на модальных окнах, которые могут появляться в течении процесса заказа, настроены эффекты плавного появления

**Тактильный отклик кнопок**  
Все интерактивные элементы интерфейса (кнопки оплаты, завершения заказа, возврата) реагируют на нажатие легким уменьшением (`active:scale-95`) или (`active:scale-90`), в зависимости от размера, и используют кастомные плавные переходы `cubic-bezier`. Это дает гостю физическое ощущение «нажатия» на плоском экране планшета

**Бесшовные скроллбары с масками**  
Стандартные системные скроллбары браузера полностью скрыты через `scrollbar-hide` (настроен в `index.css`). В каталоге, корзине и панели бариста дополнительно применены CSS-маска (`mask-image` с `linear-gradient`), которые создают эффект мягкого растворения (fade-out) карточек при прокрутке у верхнего и нижнего краев экрана

**ИИ-генерация визуального контента**  
Поскольку приложение разрабатывалось как студенческий пет-проект, бюджета в миллионы рублей на профессиональную коммерческую фуд-съемку не было. Чтобы интерфейс выглядел законченно и качественно, все фотографии напитков были сгенерированы с помощью нейросетей. Рендеры выполнены в единой перспективе с фотореалистичными текстурами, что позволило органично вписать их в минималистичный интерфейс киоска без лишних затрат на профессиональную съемку. Вариант взятия готовых фото продуктов с уже существующего заведения не рассматривался из-за авторских прав

## Архитектурные решения

**Фиксированный экран киоска 820×1180**  
Интерфейс рассчитан на портретный планшет (в осноном iPad), без адаптивной вёрстки под другие устройства. `KioskFrame` держит фиксированный размер и масштабируется через `transform: scale()` под окно браузера. На десктопе по краям остаются чёрные поля

**Redis вместо JWT для SMS и бонусов**  
Полноценные server-side сессии и JWT сознательно не используются. Redis хранит только OTP-коды, счётчики попыток, rate limit и временный флаг подтверждения списания бонусов. Для масштаба киоска этого достаточно

**SMS в dev-режиме, как заглушка**  
Коды регистрации и списания бонусов генерируются на backend и выводятся в консоль через `fmt.Printf`, реальная отправка SMS не подключена

**Панель бариста в том же SPA**  
Отдельный сервис и отдельный порт не заводились. Бариста открывает `/barista` в том же React-приложении. Обновление заказов через polling раз в 5 секунд

**Мок-оплата**  
Экраны карты и СБП имитируют терминал. Клиент сам выбирает успех или отказ, backend записывает `payment_id` вида `test_pay_*`, меняет статус заказа и обновляет колоку `updated_at`

**Снимки цен в заказе**  
В `order_items` и `order_item_options` сохраняется `price_snapshot` на момент checkout, чтобы будущие изменения меню не ломали историю чеков

**Гостевой заказ без фиктивного user_id**  
`orders.user_id` nullable с `ON DELETE SET NULL`. Заказ без бонусной программы хранится с `NULL`, а не с магическим id=0

**Сидирование без лишних абстракций**  
Опции привязываются к продуктам списками конкретных имён по категории. Исключения вроде «у Рафа нет молока» или «у матча-латте добавить молоко и сиропы» решаются точечными SQL в `seed/product_options.go`, а не отдельными сущностями option_sets

**Расчет показателей на frontend**  
Для вычисления итоговой цены, калорийности при кастомизации напитка или баланса бонусов в корзине фронтенд не отправляет запросы к базе данных на каждое действие гостя. Приложение работает с исходными данными, полученными при первичной загрузке карточки конкретного товара, а так же бонусной системы

**Frontend не в Docker**  
Vite использует Hot Module Replacement, и внутри контейнера отслеживание файлов работает хуже. Поэтому для разработки frontend запускается через Node, а Docker поднимает backend, PostgreSQL и Redis

**Единая конфигурация для двух способов запуска**  
Один файл `.env` используется и при Docker, и при локальном запуске. В compose строки подключения к postgres и redis собираются автоматически

**Пересоздание БД при каждом запуске backend**  
`main.go` вызывает `DropTables` перед `CreateTables`. Это упрощает разработку схемы, но перед демо или тестом с сохранением данных поведение нужно будет изменить

## Лицензии и атрибуция

### Код проекта

Проект распространяется под лицензией MIT. Подробнее в файле [LICENSE](LICENSE)

### Шрифт

Для оформления интерфейса используется шрифт **Manrope**, распространяемый по лицензии **SIL Open Font License, Version 1.1**  
Автор: Mikhail Sharanda  
С полным текстом лицензии можно ознакомиться по адресу: [https://openfontlicense.org](https://openfontlicense.org)

### Backend

**Go**  
Лицензия BSD-3-Clause с патентной оговоркой  
Разработчик The Go Authors  
Текст лицензии [https://github.com/golang/go/blob/master/LICENSE](https://github.com/golang/go/blob/master/LICENSE)

**Gin**  
Лицензия MIT  
Разработчик сообщество gin-gonic  
Текст лицензии [https://github.com/gin-gonic/gin/blob/master/LICENSE](https://github.com/gin-gonic/gin/blob/master/LICENSE)

**PostgreSQL**  
Лицензия PostgreSQL License, лицензия permissive-типа, похожая по духу на MIT и BSD  
Разработчик PostgreSQL Global Development Group  
Текст лицензии [https://www.postgresql.org/about/licence/](https://www.postgresql.org/about/licence/)

**pgx / pgxpool**  
Лицензия MIT  
Разработчик Jack Christensen и контрибьюторы проекта jackc/pgx  
Текст лицензии [https://github.com/jackc/pgx/blob/master/LICENSE](https://github.com/jackc/pgx/blob/master/LICENSE)

**Redis**  
Лицензия тройная, на выбор AGPLv3, RSALv2 или SSPLv1, актуально с версии 8.0 (май 2025)  
Разработчик Redis Ltd, автор оригинального проекта Salvatore Sanfilippo  
Текст лицензии [https://redis.io/legal/licenses/](https://redis.io/legal/licenses/)

**go-redis**  
Лицензия BSD-2-Clause  
Разработчик команда проекта redis/go-redis  
Текст лицензии [https://github.com/redis/go-redis/blob/master/LICENSE](https://github.com/redis/go-redis/blob/master/LICENSE)

**google/uuid**  
Лицензия BSD-3-Clause  
Разработчик Google  
Текст лицензии [https://github.com/google/uuid/blob/master/LICENSE](https://github.com/google/uuid/blob/master/LICENSE)

**godotenv**  
Лицензия MIT  
Разработчик John Barton (joho) и контрибьюторы  
Текст лицензии [https://github.com/joho/godotenv/blob/main/LICENCE](https://github.com/joho/godotenv/blob/main/LICENCE) (файл называется именно LICENCE, через C)

### Frontend

**React**  
Лицензия MIT  
Разработчик Meta Platforms, Inc.  
Текст лицензии [https://github.com/facebook/react/blob/main/LICENSE](https://github.com/facebook/react/blob/main/LICENSE)

**TypeScript**  
Лицензия Apache License 2.0  
Разработчик Microsoft  
Текст лицензии [https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt)

**Vite**  
Лицензия MIT  
Разработчик VoidZero Inc, автор оригинального проекта Evan You  
Текст лицензии [https://github.com/vitejs/vite/blob/main/packages/vite/LICENSE.md](https://github.com/vitejs/vite/blob/main/packages/vite/LICENSE.md)

**Tailwind CSS**  
Лицензия MIT  
Разработчик Tailwind Labs Inc.  
Текст лицензии [https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE](https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE)

**React Router**  
Лицензия MIT  
Разработчик Remix Software, ранее React Training, сейчас поддерживается Shopify  
Текст лицензии [https://github.com/remix-run/react-router/blob/main/LICENSE.md](https://github.com/remix-run/react-router/blob/main/LICENSE.md)

**Framer Motion**  
Лицензия MIT  
Разработчик Motion (актуальное название проекта, автор Matt Perry)  
Текст лицензии [https://github.com/motiondivision/motion/blob/main/LICENSE.md](https://github.com/motiondivision/motion/blob/main/LICENSE.md)

**Sonner**  
Лицензия MIT  
Разработчик Emil Kowalski  
Текст лицензии [https://github.com/emilkowalski/sonner/blob/main/LICENSE.md](https://github.com/emilkowalski/sonner/blob/main/LICENSE.md)

**canvas-confetti**  
Лицензия ISC  
Разработчик Kiril Vatev  
Текст лицензии [https://github.com/catdad/canvas-confetti/blob/master/LICENSE](https://github.com/catdad/canvas-confetti/blob/master/LICENSE)

### Инфраструктура

**Docker Engine (проект Moby)**  
Лицензия Apache License 2.0  
Разработчик Docker, Inc.  
Текст лицензии [https://github.com/moby/moby/blob/master/LICENSE](https://github.com/moby/moby/blob/master/LICENSE)

**Docker Compose**  
Лицензия Apache License 2.0 для исходного кода. Готовые бинарники, которые публикуются на странице релизов, распространяются уже под пользовательским соглашением Docker  
Разработчик Docker, Inc.  
Текст лицензии [https://github.com/docker/compose/blob/main/LICENSE](https://github.com/docker/compose/blob/main/LICENSE)

Отдельно стоит иметь в виду что графическое приложение Docker Desktop имеет собственные условия использования и требует платной подписки для организаций с доходом выше 10 миллионов долларов в год или числом сотрудников больше 250. На движок Docker Engine и на docker-compose.yml, используемые в проекте, это ограничение не распространяется

### Графические материалы

Все иллюстрации продуктов сгенерированы с помощью Google Gemini. Права на использование сгенерированных изображений, включая коммерческое использование, регулируются условиями предоставления услуг Google. Подробнее [https://policies.google.com/terms/generative-ai](https://policies.google.com/terms/generative-ai)

Google не заявляет прав на созданные изображения, они остаются в распоряжении пользователя, при этом сами изображения не защищены авторским правом как объект, поскольку не имеют автора-человека