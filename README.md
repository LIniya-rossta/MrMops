# Mr. Mops KG

Полноценный интернет-магазин зоотоваров Mr. Mops KG для Бишкека: каталог, поиск, фильтры, корзина, оформление заказа, доставка, контакты и отправка заказов менеджеру в Telegram.

## Архитектура

- GitHub Pages публикует статическую витрину по адресу `https://liniya-rossta.github.io/MrMops/`.
- Серверный обработчик `POST /api/order` находится в `worker/index.ts` и проверяет товары и цены перед отправкой заказа.
- Telegram-токен и ID чата задаются только на сервере через `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`. Они не должны попадать в GitHub или браузерную сборку.
- Готовая статическая витрина хранится в `docs/` и публикуется GitHub Pages из ветки `main`.

## Локальный запуск

Требуется Node.js 22.13 или новее и pnpm 11.

```bash
pnpm install
cp .env.example .env.local
pnpm run dev
```

Откройте `http://localhost:3000/`.

## Переменные окружения

```dotenv
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Заполните их в локальном `.env.local` или в защищённых переменных серверного хостинга. `.env.local` исключён из Git и не публикуется.

## Проверка и сборка

```bash
pnpm run build
pnpm run build:pages
```

- `pnpm run build` собирает серверную версию с обработчиком Telegram.
- `pnpm run build:pages` создаёт статическую витрину в `docs/`.

## GitHub Pages

В настройках репозитория выберите **Settings → Pages → Deploy from a branch**, затем ветку `main` и папку `/docs`.

GitHub Pages не запускает серверный код и не умеет безопасно хранить Telegram-токен. Поэтому форма заказа обращается к отдельному серверному обработчику, а токен остаётся скрытым от посетителей.
