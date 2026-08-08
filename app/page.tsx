"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Category = "all" | "cats" | "dogs" | "food" | "care" | "toys";

type Product = {
  id: string;
  name: string;
  short: string;
  price: number;
  image: string;
  category: Exclude<Category, "all">[];
  badge?: string;
};

const products: Product[] = [
  {
    id: "royal-canin-sterilised",
    name: "Royal Canin Sterilised",
    short: "Сухой корм для стерилизованных кошек, 2 кг",
    price: 2450,
    image: "/store/post-video-cover.jpg",
    category: ["cats", "food"],
    badge: "Хит",
  },
  {
    id: "monge-grill-pouch",
    name: "Monge Grill",
    short: "Влажный корм для кошек, 85 г",
    price: 115,
    image: "/store/post-2025-a.jpg",
    category: ["cats", "food"],
    badge: "Италия",
  },
  {
    id: "monge-jelly",
    name: "Monge Jelly",
    short: "Беззерновые консервы для кошек, 80 г",
    price: 185,
    image: "/store/post-2025-b.jpg",
    category: ["cats", "food"],
  },
  {
    id: "mnyams-delicatesse",
    name: "Мнямс Delicatesse",
    short: "Паштет для кошек, 200 г",
    price: 240,
    image: "/store/post-2025-c.jpg",
    category: ["cats", "food"],
  },
  {
    id: "optimeal-pouch",
    name: "Optimeal Adult Cat",
    short: "Влажный корм для взрослых кошек, 85 г",
    price: 145,
    image: "/store/post-2025-d.jpg",
    category: ["cats", "food"],
    badge: "12 вкусов",
  },
  {
    id: "vet-diet-recovery",
    name: "Veterinary Diet Recovery",
    short: "Ветеринарная диета для кошек и собак, 400 г",
    price: 390,
    image: "/store/post-2025-e.jpg",
    category: ["cats", "dogs", "food", "care"],
    badge: "Вет. диета",
  },
  {
    id: "doglike-puller",
    name: "Doglike Puller",
    short: "Прочная игрушка для активных собак",
    price: 850,
    image: "/store/post-2024.jpg",
    category: ["dogs", "toys"],
    badge: "Для прогулок",
  },
  {
    id: "doglike-ball",
    name: "Doglike Мяч",
    short: "Игрушка из безопасного материала, 8 см",
    price: 420,
    image: "/store/post-2024.jpg",
    category: ["dogs", "toys"],
  },
];

const categories: { id: Category; label: string; icon: string }[] = [
  { id: "all", label: "Всё", icon: "✦" },
  { id: "cats", label: "Кошкам", icon: "🐈" },
  { id: "dogs", label: "Собакам", icon: "🐕" },
  { id: "food", label: "Корма", icon: "🥣" },
  { id: "toys", label: "Игрушки", icon: "●" },
  { id: "care", label: "Уход", icon: "✚" },
];

const money = new Intl.NumberFormat("ru-RU");
const assetBase = import.meta.env.BASE_URL || "/";
const assetUrl = (path: string) => `${assetBase.replace(/\/?$/, "/")}${path.replace(/^\/+/, "")}`;
const orderEndpoint = import.meta.env.VITE_ORDER_API_URL || "/api/order";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const hydrated = useRef(false);
  const formStartedAt = useRef(Date.now());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mrmops-cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {
      localStorage.removeItem("mrmops-cart");
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) localStorage.setItem("mrmops-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const fitsCategory = category === "all" || product.category.includes(category);
      const fitsQuery = !needle || `${product.name} ${product.short}`.toLowerCase().includes(needle);
      return fitsCategory && fitsQuery;
    });
  }, [category, query]);

  const cartLines = useMemo(
    () => products.filter((product) => cart[product.id]).map((product) => ({ ...product, quantity: cart[product.id] })),
    [cart],
  );
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cartLines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  function addToCart(product: Product) {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }));
    setToast(`${product.name} — в корзине`);
  }

  function updateQuantity(id: string, delta: number) {
    setCart((current) => {
      const next = Math.max(0, (current[id] ?? 0) + delta);
      const copy = { ...current };
      if (next === 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cartLines.length) return;
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      phone: form.get("phone"),
      delivery: form.get("delivery"),
      address: form.get("address"),
      payment: form.get("payment"),
      comment: form.get("comment"),
      website: form.get("website"),
      startedAt: formStartedAt.current,
      items: cartLines.map((line) => ({ id: line.id, quantity: line.quantity })),
    };

    try {
      const response = await fetch(orderEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok?: boolean; orderId?: string; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Не удалось отправить заказ");
      setOrderId(result.orderId || "");
      setCart({});
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не удалось отправить заказ");
    } finally {
      setSubmitting(false);
    }
  }

  function openCheckout() {
    setCartOpen(false);
    setOrderId("");
    setError("");
    formStartedAt.current = Date.now();
    setCheckoutOpen(true);
  }

  return (
    <main className="store-app">
      <header className="topbar" aria-label="Шапка магазина">
        <button className="brand-button" onClick={() => scrollToId("home")} aria-label="На главную">
          <img src={assetUrl("store/mrmops-logo.jpg")} alt="Mr. Mops" />
          <span>
            <b>Mr. Mops</b>
            <small>зоомагазин • Бишкек</small>
          </span>
        </button>
        <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Корзина, товаров: ${cartCount}`}>
          <span aria-hidden="true">🛍</span>
          {cartCount > 0 && <b>{cartCount}</b>}
        </button>
      </header>

      <section className="hero" id="home">
        <img className="hero-photo" src={assetUrl("store/post-2024.jpg")} alt="Игрушки для собак в Mr. Mops" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <span className="eyebrow">6 лет заботы о питомцах</span>
          <h1>ВСЁ ДЛЯ ТЕХ,<br />КОГО ВЫ <i>ЛЮБИТЕ</i></h1>
          <p>Корма, игрушки, уход и аксессуары — доставим по Бишкеку.</p>
          <button onClick={() => scrollToId("catalog")}>Выбрать товары <span>→</span></button>
        </div>
      </section>

      <section className="trust-strip" aria-label="Преимущества магазина">
        <div><b>4.8</b><span>рейтинг в 2ГИС</span></div>
        <div><b>10:00–20:00</b><span>без выходных</span></div>
        <div><b>Сегодня</b><span>доставка по городу</span></div>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="section-heading">
          <div>
            <span className="kicker">ВЫБОР MR. MOPS</span>
            <h2>Каталог</h2>
          </div>
          <span className="product-count">{filtered.length} товаров</span>
        </div>

        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти корм, игрушку…" />
          {query && <button onClick={() => setQuery("")} aria-label="Очистить поиск">×</button>}
        </label>

        <div className="category-row" aria-label="Категории товаров">
          {categories.map((item) => (
            <button
              key={item.id}
              className={category === item.id ? "active" : ""}
              onClick={() => setCategory(item.id)}
              aria-pressed={category === item.id}
            >
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>

        {filtered.length ? (
          <div className="product-grid">
            {filtered.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image-wrap">
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <img src={assetUrl(product.image)} alt={product.name} loading="lazy" />
                </div>
                <div className="product-info">
                  <p>{product.short}</p>
                  <h3>{product.name}</h3>
                  <div className="product-buy">
                    <strong>{money.format(product.price)} <small>сом</small></strong>
                    <button onClick={() => addToCart(product)} aria-label={`Добавить ${product.name} в корзину`}>+</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-search">
            <span>🐾</span>
            <h3>Такого товара пока не нашли</h3>
            <p>Попробуйте другой запрос или напишите нам — поможем подобрать.</p>
            <button onClick={() => { setQuery(""); setCategory("all"); }}>Показать всё</button>
          </div>
        )}
      </section>

      <section className="delivery-banner" id="delivery">
        <span className="kicker dark">ДОСТАВКА</span>
        <h2>Пакуем с заботой.<br />Привозим быстро.</h2>
        <div className="delivery-photo">
          <img src={assetUrl("store/post-new-1.jpg")} alt="Условия доставки Mr. Mops" loading="lazy" />
        </div>
        <div className="delivery-list">
          <div><b>01</b><p><strong>По Бишкеку</strong><span>Через Яндекс. Стоимость рассчитывается по адресу.</span></p></div>
          <div><b>02</b><p><strong>В регионы</strong><span>Курьерской службой. Заказ на следующий день — до 15:00.</span></p></div>
          <div><b>03</b><p><strong>Самовывоз</strong><span>5 мкр., ул. Каралаева, 33/3, напротив маркета «Азия».</span></p></div>
        </div>
      </section>

      <section className="faq-section" id="faq">
        <span className="kicker">ПОМОЩЬ</span>
        <h2>Частые вопросы</h2>
        <div className="faq-list">
          <details>
            <summary>Как оформить заказ?<span>+</span></summary>
            <p>Добавьте товары в корзину, укажите телефон и адрес. Заказ сразу поступит менеджеру Mr. Mops в Telegram.</p>
          </details>
          <details>
            <summary>Можно подобрать корм вместе?<span>+</span></summary>
            <p>Да. Оставьте комментарий к заказу или напишите в WhatsApp. Заказы, которым нужна консультация, принимаем до 16:00.</p>
          </details>
          <details>
            <summary>Как оплатить?<span>+</span></summary>
            <p>Наличными, переводом с карты или по QR-коду. Менеджер подтвердит доступный способ при согласовании заказа.</p>
          </details>
          <details>
            <summary>Цены и наличие актуальны?<span>+</span></summary>
            <p>Каталог регулярно обновляется, но итоговое наличие менеджер подтвердит перед доставкой.</p>
          </details>
        </div>
      </section>

      <section className="reviews-section">
        <div className="section-heading light">
          <div><span className="kicker dark">НАС ВЫБИРАЮТ</span><h2>4.8 из 5</h2></div>
          <div className="stars" aria-label="Пять звезд">★★★★★</div>
        </div>
        <div className="review-cards">
          <article><p>«Всегда помогают подобрать корм, всё объясняют спокойно и по делу. Доставка удобная.»</p><span>Покупатель Mr. Mops</span></article>
          <article><p>«Большой выбор для кошек и собак. Нравится, что можно быстро уточнить наличие в WhatsApp.»</p><span>Покупатель Mr. Mops</span></article>
        </div>
        <a href="https://2gis.kg/bishkek/firm/70000001041670755/tab/reviews" target="_blank" rel="noreferrer">Отзывы в 2ГИС <span>↗</span></a>
      </section>

      <section className="contacts-section" id="contacts">
        <img src={assetUrl("store/mrmops-logo.jpg")} alt="Логотип Mr. Mops" className="footer-logo" />
        <span className="kicker">МЫ РЯДОМ</span>
        <h2>Заглядывайте<br />в гости</h2>
        <p className="address">5 мкр., ул. Каралаева, 33/3<br />Ежедневно, 10:00–20:00</p>
        <div className="contact-links">
          <a href="https://wa.me/996505112255" target="_blank" rel="noreferrer"><span>WhatsApp</span><b>+996 505 11 22 55</b></a>
          <a href="https://www.instagram.com/mr.mops.kg/" target="_blank" rel="noreferrer"><span>Instagram</span><b>@mr.mops.kg</b></a>
          <a href="https://2gis.kg/bishkek/firm/70000001041670755" target="_blank" rel="noreferrer"><span>Карта</span><b>Построить маршрут ↗</b></a>
        </div>
        <small className="legal">Цены и наличие товаров носят ознакомительный характер. © 2026 Mr. Mops KG</small>
      </section>

      <nav className="bottom-nav" aria-label="Основная навигация">
        <button onClick={() => scrollToId("home")}><span>⌂</span>Главная</button>
        <button onClick={() => scrollToId("catalog")}><span>▦</span>Каталог</button>
        <button onClick={() => scrollToId("delivery")}><span>⌁</span>Доставка</button>
        <button onClick={() => setCartOpen(true)} className={cartCount ? "has-items" : ""}><span>🛍</span>Корзина{cartCount > 0 && <b>{cartCount}</b>}</button>
      </nav>

      {cartOpen && (
        <div className="modal-layer" role="presentation" onMouseDown={() => setCartOpen(false)}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="drawer-head"><div><span className="kicker">ВАШ ЗАКАЗ</span><h2 id="cart-title">Корзина</h2></div><button onClick={() => setCartOpen(false)} aria-label="Закрыть корзину">×</button></div>
            {cartLines.length ? (
              <>
                <div className="cart-lines">
                  {cartLines.map((line) => (
                    <article key={line.id}>
                      <img src={assetUrl(line.image)} alt="" />
                      <div><h3>{line.name}</h3><span>{money.format(line.price)} сом</span></div>
                      <div className="quantity"><button onClick={() => updateQuantity(line.id, -1)} aria-label="Уменьшить количество">−</button><b>{line.quantity}</b><button onClick={() => updateQuantity(line.id, 1)} aria-label="Увеличить количество">+</button></div>
                    </article>
                  ))}
                </div>
                <div className="cart-total"><span>Товары</span><strong>{money.format(subtotal)} сом</strong><small>Доставка рассчитывается отдельно</small></div>
                <button className="primary-action" onClick={openCheckout}>Оформить заказ <span>→</span></button>
              </>
            ) : (
              <div className="empty-cart"><span>🦴</span><h3>Корзина пока пустая</h3><p>Добавьте любимцу что-нибудь вкусное или веселое.</p><button onClick={() => { setCartOpen(false); scrollToId("catalog"); }}>Перейти в каталог</button></div>
            )}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="modal-layer checkout-layer" role="presentation" onMouseDown={() => !submitting && setCheckoutOpen(false)}>
          <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="drawer-head"><div><span className="kicker">ПОЧТИ ГОТОВО</span><h2 id="checkout-title">Оформление</h2></div><button onClick={() => setCheckoutOpen(false)} aria-label="Закрыть оформление">×</button></div>
            {orderId ? (
              <div className="order-success">
                <span>✓</span>
                <h3>Заказ отправлен!</h3>
                <p>Менеджер Mr. Mops получил заказ <b>#{orderId}</b> и скоро свяжется с вами.</p>
                <button className="primary-action" onClick={() => setCheckoutOpen(false)}>Отлично</button>
              </div>
            ) : (
              <form onSubmit={submitOrder}>
                <label><span>Имя</span><input name="name" required maxLength={80} placeholder="Как к вам обращаться?" autoComplete="name" /></label>
                <label><span>Телефон</span><input name="phone" required maxLength={30} placeholder="+996 ___ __ __ __" inputMode="tel" autoComplete="tel" /></label>
                <label><span>Получение</span><select name="delivery" defaultValue="Доставка по Бишкеку"><option>Доставка по Бишкеку</option><option>Самовывоз</option><option>Доставка в регион</option></select></label>
                <label><span>Адрес или район</span><input name="address" required maxLength={180} placeholder="Например: 7 мкр., дом 21" autoComplete="street-address" /></label>
                <label><span>Оплата</span><select name="payment"><option>Согласовать с менеджером</option><option>Наличными</option><option>Перевод / QR</option></select></label>
                <label><span>Комментарий</span><textarea name="comment" maxLength={500} placeholder="Вкус корма, подъезд, удобное время…" rows={3} /></label>
                <label className="website-field" aria-hidden="true"><span>Сайт</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
                <div className="checkout-summary"><span>{cartCount} шт.</span><strong>{money.format(subtotal)} сом</strong></div>
                {error && <p className="form-error">{error}</p>}
                <button className="primary-action" disabled={submitting}>{submitting ? "Отправляем…" : "Подтвердить заказ"}<span>→</span></button>
                <small>Нажимая кнопку, вы соглашаетесь на обработку данных для оформления заказа.</small>
              </form>
            )}
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </main>
  );
}
