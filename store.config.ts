export type ServiceCategory = "all" | "packages" | "sales" | "automation" | "design" | "support";

export type StoreService = {
  id: string;
  name: string;
  short: string;
  price: number;
  category: Exclude<ServiceCategory, "all">[];
  badge?: string;
  accent: "lime" | "blue" | "coral" | "violet" | "sand";
  symbol: string;
};

export const studioConfig = {
  brand: {
    name: "ЛИНИЯ РОСТА",
    monogram: "ЛР",
    subtitle: "digital-студия • Бишкек",
    telegramLabel: "Заявка напрямую в Telegram",
  },
  hero: {
    eyebrow: "САЙТЫ, КОТОРЫЕ ПРИНОСЯТ ЗАЯВКИ",
    title: "ИНТЕРНЕТ-МАГАЗИН ПОД ВАШ БИЗНЕС",
    description: "Меняем бренд, каталог, цвета и контакты. Подключаем корзину, оплату и Telegram — от идеи до запуска от 7 дней.",
  },
  currency: "сом",
  categories: [
    { id: "all" as const, label: "Всё", icon: "✦" },
    { id: "packages" as const, label: "Пакеты", icon: "01" },
    { id: "sales" as const, label: "Продажи", icon: "↗" },
    { id: "automation" as const, label: "Автоматизация", icon: "⚡" },
    { id: "design" as const, label: "Дизайн", icon: "◐" },
    { id: "support" as const, label: "Поддержка", icon: "∞" },
  ],
  services: [
    {
      id: "store-start",
      name: "Магазин Старт",
      short: "До 20 товаров, корзина, заявки в Telegram, мобильная версия",
      price: 24900,
      category: ["packages", "sales"],
      badge: "Быстрый запуск",
      accent: "lime",
      symbol: "S",
    },
    {
      id: "store-business",
      name: "Магазин Бизнес",
      short: "До 100 товаров, категории, поиск, оплата и доставка",
      price: 44900,
      category: ["packages", "sales", "automation"],
      badge: "Выбирают чаще",
      accent: "blue",
      symbol: "B",
    },
    {
      id: "store-pro",
      name: "Магазин Pro",
      short: "Большой каталог, CRM, аналитика и индивидуальные сценарии",
      price: 74900,
      category: ["packages", "sales", "automation"],
      badge: "Под ключ",
      accent: "violet",
      symbol: "P",
    },
    {
      id: "telegram-orders",
      name: "Telegram-заказы",
      short: "Каждая заявка с товарами и контактами сразу у менеджера",
      price: 4900,
      category: ["automation", "sales"],
      accent: "blue",
      symbol: "TG",
    },
    {
      id: "online-payment",
      name: "Онлайн-оплата",
      short: "Подключение платёжной страницы и понятного сценария оплаты",
      price: 9900,
      category: ["sales", "automation"],
      accent: "coral",
      symbol: "₸",
    },
    {
      id: "crm-leads",
      name: "CRM и заявки",
      short: "Статусы, уведомления и единый поток обращений для команды",
      price: 9900,
      category: ["automation"],
      accent: "violet",
      symbol: "CRM",
    },
    {
      id: "catalog-setup",
      name: "Каталог под ключ",
      short: "Структура, карточки, характеристики и подготовка изображений",
      price: 6900,
      category: ["design", "sales"],
      accent: "sand",
      symbol: "CAT",
    },
    {
      id: "monthly-support",
      name: "Поддержка",
      short: "Обновления, новые товары и помощь после запуска — за месяц",
      price: 3900,
      category: ["support"],
      accent: "lime",
      symbol: "24",
    },
  ] satisfies StoreService[],
  industries: ["Цветы", "Одежда", "Косметика", "Еда", "Мебель", "Услуги", "Обучение", "Производство"],
  process: [
    { number: "01", title: "Разбираем бизнес", text: "Товары, клиенты, доставка, способы оплаты и обработка заявок." },
    { number: "02", title: "Адаптируем дизайн", text: "Ваши логотип, цвета, фотографии и тексты — без ощущения шаблона." },
    { number: "03", title: "Подключаем продажи", text: "Корзина, форма заказа, Telegram, аналитика и нужные интеграции." },
    { number: "04", title: "Запускаем и поддерживаем", text: "Проверяем на телефонах, публикуем и остаёмся на связи после старта." },
  ],
  faq: [
    { question: "Подойдёт ли сайт для моей сферы?", answer: "Да. Основа white-label: меняются структура каталога, карточки, тексты, цвета и логика заказа. Покажем подходящий сценарий до начала работ." },
    { question: "Сколько времени занимает запуск?", answer: "Стартовая версия обычно готова от 7 рабочих дней. Большой каталог и нестандартные интеграции оцениваются отдельно." },
    { question: "Куда приходят заявки?", answer: "В Telegram менеджера вместе с выбранными товарами, суммой, телефоном и комментарием клиента. При необходимости подключим CRM или почту." },
    { question: "Можно использовать свой домен?", answer: "Да. Подключим домен компании, HTTPS и аналитику. Репозиторий и доступы передаются заказчику." },
  ],
} as const;

export const serviceCatalog = Object.fromEntries(
  studioConfig.services.map((service) => [service.id, { name: service.name, price: service.price }]),
) as Record<string, { name: string; price: number }>;
