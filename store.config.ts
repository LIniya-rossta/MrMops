export type ProductCategory = "all" | "cats" | "dogs" | "care" | "birds" | "fish" | "small";

export type PetProduct = {
  id: string;
  name: string;
  short: string;
  price: number;
  category: Exclude<ProductCategory, "all">[];
  badge?: string;
  accent: "mint" | "sky" | "peach" | "lilac" | "sand" | "yellow";
  symbol: string;
  pack: string;
};

export const petStoreConfig = {
  brand: {
    name: "ЛАПА МАРКЕТ",
    monogram: "ЛМ",
    subtitle: "всё для ваших любимцев",
    city: "Бишкек",
    phone: "+996 (555) 00-00-00",
    telegramLabel: "Заказ поступит менеджеру в Telegram",
  },
  hero: {
    eyebrow: "ЗООМАГАЗИН С ДОСТАВКОЙ ПО БИШКЕКУ",
    description: "Корма, лакомства, уход и игрушки для тех, кто делает каждый день счастливее. Поможем выбрать и доставим до двери.",
  },
  currency: "сом",
  categories: [
    { id: "all" as const, label: "Все товары", icon: "✦" },
    { id: "cats" as const, label: "Кошкам", icon: "🐱" },
    { id: "dogs" as const, label: "Собакам", icon: "🐶" },
    { id: "care" as const, label: "Уход", icon: "✚" },
    { id: "birds" as const, label: "Птицам", icon: "🐦" },
    { id: "fish" as const, label: "Рыбкам", icon: "🐠" },
    { id: "small" as const, label: "Грызунам", icon: "🐹" },
  ],
  products: [
    {
      id: "murrmix-salmon",
      name: "MurrMix с лососем",
      short: "Полнорационный сухой корм для взрослых кошек",
      price: 890,
      category: ["cats"],
      badge: "Хит",
      accent: "mint",
      symbol: "MM",
      pack: "1,5 кг",
    },
    {
      id: "wild-hills-lamb",
      name: "Wild Hills с ягнёнком",
      short: "Сбалансированный корм для взрослых собак",
      price: 1490,
      category: ["dogs"],
      badge: "Выбор хозяев",
      accent: "sky",
      symbol: "WH",
      pack: "3 кг",
    },
    {
      id: "soft-paws-litter",
      name: "Soft Paws наполнитель",
      short: "Комкующийся бентонитовый наполнитель без пыли",
      price: 590,
      category: ["cats", "care"],
      accent: "lilac",
      symbol: "SP",
      pack: "5 л",
    },
    {
      id: "duck-bites",
      name: "Duck Bites",
      short: "Мягкие лакомства из утиного филе для собак",
      price: 320,
      category: ["dogs"],
      badge: "Без сахара",
      accent: "peach",
      symbol: "DB",
      pack: "100 г",
    },
    {
      id: "happy-tail-rope",
      name: "Happy Tail канат",
      short: "Прочная игрушка для перетягивания и активных игр",
      price: 450,
      category: ["dogs"],
      accent: "yellow",
      symbol: "HT",
      pack: "32 см",
    },
    {
      id: "pure-coat-shampoo",
      name: "Pure Coat шампунь",
      short: "Мягкое очищение и блеск шерсти собак и кошек",
      price: 680,
      category: ["cats", "dogs", "care"],
      accent: "mint",
      symbol: "PC",
      pack: "300 мл",
    },
    {
      id: "aqua-color-flakes",
      name: "Aqua Color Flakes",
      short: "Ежедневный корм для яркого окраса аквариумных рыб",
      price: 390,
      category: ["fish"],
      accent: "sky",
      symbol: "AQ",
      pack: "100 мл",
    },
    {
      id: "tweet-mix",
      name: "Tweet Mix",
      short: "Зерновая смесь для волнистых попугаев",
      price: 280,
      category: ["birds"],
      accent: "yellow",
      symbol: "TM",
      pack: "500 г",
    },
    {
      id: "cozy-burrow",
      name: "Cozy Burrow домик",
      short: "Тёплый текстильный домик для хомяков и мышей",
      price: 520,
      category: ["small"],
      accent: "peach",
      symbol: "CB",
      pack: "1 шт.",
    },
    {
      id: "fresh-smile-gel",
      name: "Fresh Smile гель",
      short: "Гель для гигиены зубов и свежего дыхания питомца",
      price: 740,
      category: ["cats", "dogs", "care"],
      badge: "Вет. уход",
      accent: "lilac",
      symbol: "FS",
      pack: "75 мл",
    },
    {
      id: "tiny-friends-mix",
      name: "Tiny Friends Mix",
      short: "Полноценная смесь для хомяков и декоративных крыс",
      price: 360,
      category: ["small"],
      accent: "sand",
      symbol: "TF",
      pack: "600 г",
    },
    {
      id: "feather-fun",
      name: "Feather Fun удочка",
      short: "Игрушка с перьями для охоты, движения и игры",
      price: 250,
      category: ["cats"],
      badge: "Новинка",
      accent: "peach",
      symbol: "FF",
      pack: "1 шт.",
    },
  ] satisfies PetProduct[],
  petTypes: ["Кошки", "Собаки", "Птицы", "Рыбки", "Грызуны", "Уход и гигиена"],
  benefits: [
    { number: "01", title: "Проверенный ассортимент", text: "Подбираем товары на каждый день и следим за сроками годности." },
    { number: "02", title: "Помощь с выбором", text: "Уточним возраст и особенности питомца, чтобы предложить подходящий вариант." },
    { number: "03", title: "Доставка по Бишкеку", text: "Привезём заказ в удобный интервал или подготовим к самовывозу." },
    { number: "04", title: "Заказ за пару минут", text: "Корзина, контакты и комментарий сразу поступают менеджеру в Telegram." },
  ],
  faq: [
    { question: "Как быстро доставляете заказ?", answer: "По Бишкеку обычно доставляем в день заказа или на следующий день. Менеджер подтвердит удобный интервал после оформления." },
    { question: "Можно забрать заказ самостоятельно?", answer: "Да. Выберите самовывоз при оформлении — менеджер сообщит адрес и подтвердит готовность заказа." },
    { question: "Как оплатить?", answer: "Можно оплатить наличными, переводом или QR. Для самовывоза доступна оплата при получении." },
    { question: "Поможете подобрать корм?", answer: "Конечно. Напишите возраст, вес и особенности питомца в комментарии — менеджер уточнит детали и поможет с выбором." },
  ],
} as const;

export const productCatalog = Object.fromEntries(
  petStoreConfig.products.map((product) => [product.id, { name: product.name, price: product.price, pack: product.pack }]),
) as Record<string, { name: string; price: number; pack: string }>;
