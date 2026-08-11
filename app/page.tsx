"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { PetProduct, petStoreConfig, ProductCategory } from "../store.config";

const money = new Intl.NumberFormat("ru-RU");
const orderEndpoint = import.meta.env.VITE_ORDER_API_URL || "/api/order";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [category, setCategory] = useState<ProductCategory>("all");
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
      const saved = localStorage.getItem("pet-store-cart-v1");
      if (saved) setCart(JSON.parse(saved));
    } catch {
      localStorage.removeItem("pet-store-cart-v1");
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) localStorage.setItem("pet-store-cart-v1", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return petStoreConfig.products.filter((product) => {
      const fitsCategory = category === "all" || product.category.includes(category);
      const fitsQuery = !needle || `${product.name} ${product.short} ${product.pack}`.toLowerCase().includes(needle);
      return fitsCategory && fitsQuery;
    });
  }, [category, query]);

  const cartLines = useMemo(
    () => petStoreConfig.products
      .filter((product) => cart[product.id])
      .map((product) => ({ ...product, quantity: cart[product.id] })),
    [cart],
  );
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cartLines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const deliveryPrice = subtotal >= 3000 ? 0 : 250;

  function addToCart(product: PetProduct) {
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

  function chooseCategory(nextCategory: ProductCategory) {
    setCategory(nextCategory);
    scrollToId("catalog");
  }

  function openCheckout() {
    if (!cartLines.length) return;
    setCartOpen(false);
    setOrderId("");
    setError("");
    formStartedAt.current = Date.now();
    setCheckoutOpen(true);
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
      if (!response.ok || !result.ok) throw new Error(result.error || "Не удалось оформить заказ");
      setOrderId(result.orderId || "");
      setCart({});
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не удалось оформить заказ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="pet-app">
      <div className="announcement">БЕСПЛАТНАЯ ДОСТАВКА ПО БИШКЕКУ ОТ 3 000 СОМ <span>•</span> ЗАКАЗЫ 24/7</div>

      <header className="site-header" aria-label="Навигация">
        <button className="wordmark" onClick={() => scrollToId("home")} aria-label="На главную">
          <span>{petStoreConfig.brand.monogram}</span>
          <b>{petStoreConfig.brand.name}<small>{petStoreConfig.brand.subtitle}</small></b>
        </button>
        <nav className="desktop-nav" aria-label="Разделы сайта">
          <button onClick={() => scrollToId("catalog")}>Каталог</button>
          <button onClick={() => scrollToId("benefits")}>Почему мы</button>
          <button onClick={() => scrollToId("faq")}>Доставка и оплата</button>
        </nav>
        <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Корзина, товаров: ${cartCount}`}>
          <span>Корзина</span><b>{cartCount || "0"}</b>
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <span className="eyebrow">{petStoreConfig.hero.eyebrow}</span>
          <h1>ВСЁ ДЛЯ<br /><i>СЧАСТЛИВЫХ</i><br />ЛАПОК</h1>
          <p>{petStoreConfig.hero.description}</p>
          <div className="hero-actions">
            <button className="button-primary" onClick={() => scrollToId("catalog")}>Перейти в каталог <span>↗</span></button>
            <button className="button-secondary" onClick={() => chooseCategory("cats")}>Товары для кошек</button>
          </div>
          <div className="hero-notes"><span>✓ Поможем выбрать</span><span>✓ Доставим сегодня</span></div>
        </div>

        <div className="pet-collage" aria-label="Товары для домашних животных">
          <div className="pet-blob blob-main"><span>🐶</span><b>СОБАКАМ</b></div>
          <div className="pet-blob blob-small"><span>🐱</span><b>КОШКАМ</b></div>
          <div className="hero-pack pack-one"><i>MM</i><strong>MurrMix</strong><small>лосось • 1,5 кг</small></div>
          <div className="hero-pack pack-two"><i>WH</i><strong>Wild Hills</strong><small>ягнёнок • 3 кг</small></div>
          <div className="discount-sticker">−15%<small>на первый заказ</small></div>
          <div className="delivery-popover"><span>✓</span><p><small>ЗАКАЗ ПРИНЯТ</small><b>Доставим сегодня</b><i>Telegram • сейчас</i></p></div>
        </div>
      </section>

      <section className="pet-links" aria-label="Выбор по питомцу">
        {petStoreConfig.categories.slice(1).map((item) => (
          <button key={item.id} onClick={() => chooseCategory(item.id)}><span>{item.icon}</span><b>{item.label}</b><i>→</i></button>
        ))}
      </section>

      <section className="catalog-section" id="catalog">
        <div className="section-intro">
          <div><span className="kicker">ПОПУЛЯРНОЕ ДЛЯ ПИТОМЦЕВ</span><h2>Выбирайте с заботой</h2></div>
          <p>Товары для ежедневного ухода, питания и игр. Всё самое нужное — в одном заказе.</p>
        </div>

        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти корм, игрушку или уход…" />
          {query && <button onClick={() => setQuery("")} aria-label="Очистить поиск">×</button>}
        </label>

        <div className="category-row" aria-label="Категории товаров">
          {petStoreConfig.categories.map((item) => (
            <button key={item.id} className={category === item.id ? "active" : ""} onClick={() => setCategory(item.id)} aria-pressed={category === item.id}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>

        {filtered.length ? (
          <div className="product-grid">
            {filtered.map((product) => (
              <article className="product-card" key={product.id}>
                <div className={`product-visual accent-${product.accent}`}>
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <div className="package-art"><i>{product.symbol}</i><small>PET CARE</small></div>
                  <span className="pack-size">{product.pack}</span>
                </div>
                <div className="product-info">
                  <p>{product.short}</p><h3>{product.name}</h3>
                  <div><strong>{money.format(product.price)} <small>{petStoreConfig.currency}</small></strong><button onClick={() => addToCart(product)} aria-label={`Добавить ${product.name} в корзину`}>+</button></div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-search"><span>⌕</span><h3>Ничего не нашли</h3><p>Попробуйте другое название или посмотрите все товары.</p><button onClick={() => { setQuery(""); setCategory("all"); }}>Показать всё</button></div>
        )}
      </section>

      <section className="promo-section">
        <div><span className="kicker kicker-dark">ЗАБОТА В КАЖДОМ ЗАКАЗЕ</span><h2>Лучшее —<br />вашему хвостику.</h2><p>Соберите корзину от 3 000 сом, и мы бесплатно доставим её по Бишкеку.</p><button className="button-primary light" onClick={() => scrollToId("catalog")}>Выбрать товары <span>↗</span></button></div>
        <div className="promo-orbit"><span>🐾</span><i>БЕСПЛАТНО</i><b>ДОСТАВКА</b><small>от 3 000 сом</small></div>
      </section>

      <section className="benefits-section" id="benefits">
        <div className="section-intro"><div><span className="kicker">ПОЧЕМУ НАМ ДОВЕРЯЮТ</span><h2>Знаем, что любят питомцы</h2></div><p>Собрали понятный сервис без лишних звонков и долгого ожидания.</p></div>
        <div className="benefit-grid">
          {petStoreConfig.benefits.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
        </div>
      </section>

      <section className="faq-section" id="faq">
        <span className="kicker">ВАЖНО ЗНАТЬ</span><h2>Доставка и оплата</h2>
        <div className="faq-list">
          {petStoreConfig.faq.map((item) => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}
        </div>
      </section>

      <footer className="store-footer">
        <div><span className="footer-logo">{petStoreConfig.brand.monogram}</span><h2>{petStoreConfig.brand.name}</h2><p>{petStoreConfig.brand.subtitle}</p></div>
        <div><small>КАТАЛОГ</small><button onClick={() => chooseCategory("cats")}>Кошкам</button><button onClick={() => chooseCategory("dogs")}>Собакам</button><button onClick={() => chooseCategory("care")}>Уход</button></div>
        <div><small>ПОКУПАТЕЛЯМ</small><button onClick={() => scrollToId("faq")}>Доставка и оплата</button><button onClick={() => setCartOpen(true)}>Корзина</button><span>{petStoreConfig.brand.city}</span></div>
        <div className="studio-credit"><small>WHITE-LABEL РЕШЕНИЕ</small><b>Сайт для зоомагазина<br />от студии «Линия роста»</b><span>© 2026</span></div>
      </footer>

      <nav className="bottom-nav" aria-label="Основная навигация">
        <button onClick={() => scrollToId("home")}><span>⌂</span>Главная</button>
        <button onClick={() => scrollToId("catalog")}><span>▦</span>Каталог</button>
        <button onClick={() => setCategory("cats")}><span>♡</span>Питомцам</button>
        <button onClick={() => setCartOpen(true)} className={cartCount ? "has-items" : ""}><span>⌑</span>Корзина{cartCount > 0 && <b>{cartCount}</b>}</button>
      </nav>

      {cartOpen && (
        <div className="modal-layer" role="presentation" onMouseDown={() => setCartOpen(false)}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="drawer-head"><div><span className="kicker">ВАШИ ПОКУПКИ</span><h2 id="cart-title">Корзина</h2></div><button onClick={() => setCartOpen(false)} aria-label="Закрыть корзину">×</button></div>
            {cartLines.length ? <>
              <div className="cart-lines">{cartLines.map((line) => <article key={line.id}><span className={`mini-symbol accent-${line.accent}`}>{line.symbol}</span><div><h3>{line.name}</h3><span>{money.format(line.price)} сом • {line.pack}</span></div><div className="quantity"><button onClick={() => updateQuantity(line.id, -1)} aria-label="Уменьшить количество">−</button><b>{line.quantity}</b><button onClick={() => updateQuantity(line.id, 1)} aria-label="Увеличить количество">+</button></div></article>)}</div>
              <div className="delivery-progress"><span>{subtotal >= 3000 ? "✓ Бесплатная доставка" : `Ещё ${money.format(3000 - subtotal)} сом до бесплатной доставки`}</span><i><b style={{ width: `${Math.min(100, subtotal / 30)}%` }} /></i></div>
              <div className="cart-total"><span>Товары</span><strong>{money.format(subtotal)} сом</strong><small>Доставка: {deliveryPrice ? `${deliveryPrice} сом` : "бесплатно"}</small></div>
              <button className="button-primary wide" onClick={openCheckout}>Оформить заказ <span>↗</span></button>
            </> : <div className="empty-cart"><span>🐾</span><h3>Корзина пока пустая</h3><p>Добавьте любимцу корм, лакомство или новую игрушку.</p><button onClick={() => { setCartOpen(false); scrollToId("catalog"); }}>Перейти в каталог</button></div>}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="modal-layer checkout-layer" role="presentation" onMouseDown={() => !submitting && setCheckoutOpen(false)}>
          <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="drawer-head"><div><span className="kicker">ПОЧТИ ГОТОВО</span><h2 id="checkout-title">Оформление</h2></div><button onClick={() => setCheckoutOpen(false)} aria-label="Закрыть форму">×</button></div>
            {orderId ? <div className="order-success"><span>✓</span><h3>Заказ оформлен!</h3><p>Заказ <b>#{orderId}</b> уже у менеджера. Скоро свяжемся для подтверждения.</p><button className="button-primary wide" onClick={() => setCheckoutOpen(false)}>Готово</button></div> :
              <form onSubmit={submitOrder}>
                <label><span>Имя</span><input name="name" required maxLength={80} placeholder="Как к вам обращаться?" autoComplete="name" /></label>
                <label><span>Телефон</span><input name="phone" required maxLength={30} placeholder="+996 ___ __ __ __" inputMode="tel" autoComplete="tel" /></label>
                <label><span>Получение</span><select name="delivery" defaultValue="Доставка по Бишкеку"><option>Доставка по Бишкеку</option><option>Самовывоз</option><option>Доставка в другой город</option></select></label>
                <label><span>Оплата</span><select name="payment"><option>Перевод / QR</option><option>Наличными</option><option>При получении</option></select></label>
                <label><span>Адрес или район</span><input name="address" required maxLength={180} placeholder="Например: 4 мкр, дом 12" autoComplete="street-address" /></label>
                <label><span>Комментарий</span><textarea name="comment" maxLength={500} placeholder="Подъезд, этаж или пожелания к заказу" rows={3} /></label>
                <label className="website-field" aria-hidden="true"><span>Сайт</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
                <div className="checkout-summary"><span>{cartCount} шт. • доставка {deliveryPrice ? `${deliveryPrice} сом` : "бесплатно"}</span><strong>{money.format(subtotal + deliveryPrice)} сом</strong></div>
                {error && <p className="form-error">{error}</p>}
                <button className="button-primary wide" disabled={submitting}>{submitting ? "Отправляем…" : "Подтвердить заказ"}<span>↗</span></button>
                <small>{petStoreConfig.brand.telegramLabel}. Нажимая кнопку, вы соглашаетесь на обработку данных.</small>
              </form>}
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </main>
  );
}
