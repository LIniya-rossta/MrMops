"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ServiceCategory, studioConfig, StoreService } from "../store.config";

const money = new Intl.NumberFormat("ru-RU");
const orderEndpoint = import.meta.env.VITE_ORDER_API_URL || "/api/order";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [category, setCategory] = useState<ServiceCategory>("all");
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
      const saved = localStorage.getItem("liniya-project");
      if (saved) setCart(JSON.parse(saved));
    } catch {
      localStorage.removeItem("liniya-project");
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) localStorage.setItem("liniya-project", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return studioConfig.services.filter((service) => {
      const fitsCategory = category === "all" || service.category.includes(category);
      const fitsQuery = !needle || `${service.name} ${service.short}`.toLowerCase().includes(needle);
      return fitsCategory && fitsQuery;
    });
  }, [category, query]);

  const cartLines = useMemo(
    () => studioConfig.services
      .filter((service) => cart[service.id])
      .map((service) => ({ ...service, quantity: cart[service.id] })),
    [cart],
  );
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cartLines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  function addToCart(service: StoreService) {
    setCart((current) => ({ ...current, [service.id]: (current[service.id] ?? 0) + 1 }));
    setToast(`${service.name} — добавлено в расчёт`);
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

  function openCheckout() {
    if (!cartLines.length) return;
    setCartOpen(false);
    setOrderId("");
    setError("");
    formStartedAt.current = Date.now();
    setCheckoutOpen(true);
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
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
      if (!response.ok || !result.ok) throw new Error(result.error || "Не удалось отправить заявку");
      setOrderId(result.orderId || "");
      setCart({});
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не удалось отправить заявку");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="agency-app">
      <header className="site-header" aria-label="Навигация">
        <button className="wordmark" onClick={() => scrollToId("home")} aria-label="На главную">
          <span>{studioConfig.brand.monogram}</span>
          <b>{studioConfig.brand.name}<small>{studioConfig.brand.subtitle}</small></b>
        </button>
        <nav className="desktop-nav" aria-label="Разделы сайта">
          <button onClick={() => scrollToId("services")}>Решения</button>
          <button onClick={() => scrollToId("process")}>Как работаем</button>
          <button onClick={() => scrollToId("faq")}>Вопросы</button>
        </nav>
        <button className="project-button" onClick={() => setCartOpen(true)} aria-label={`Расчёт проекта, позиций: ${cartCount}`}>
          <span>Расчёт</span><b>{cartCount || "+"}</b>
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <span className="eyebrow">{studioConfig.hero.eyebrow}</span>
          <h1>ИНТЕРНЕТ-МАГАЗИН<br />ПОД <i>ВАШ БИЗНЕС</i></h1>
          <p>{studioConfig.hero.description}</p>
          <div className="hero-actions">
            <button className="button-primary" onClick={() => scrollToId("services")}>Собрать проект <span>↗</span></button>
            <button className="button-secondary" onClick={() => scrollToId("showcase")}>Что внутри</button>
          </div>
        </div>

        <div className="storefront-preview" aria-label="Пример интернет-магазина">
          <div className="preview-browser">
            <div className="browser-bar"><i /><i /><i /><span>yourbrand.kg</span><b>🛒 2</b></div>
            <div className="preview-hero">
              <span>ВАШ БРЕНД</span>
              <h2>Товары, которые<br />хочется купить</h2>
              <button>В каталог →</button>
            </div>
            <div className="preview-products">
              <article><i className="tile-lime">01</i><span>Новинка</span><b>2 900 сом</b></article>
              <article><i className="tile-blue">02</i><span>Хит продаж</span><b>4 500 сом</b></article>
              <article><i className="tile-coral">03</i><span>Для бизнеса</span><b>7 200 сом</b></article>
            </div>
          </div>
          <div className="order-popover"><span>✓</span><p><small>НОВАЯ ЗАЯВКА</small><b>Заказ получен</b><i>Telegram • сейчас</i></p></div>
          <div className="growth-sticker">+ заявки</div>
        </div>
      </section>

      <section className="proof-strip" aria-label="Преимущества">
        <div><b>7+</b><span>дней до запуска</span></div>
        <div><b>100%</b><span>адаптивный дизайн</span></div>
        <div><b>24/7</b><span>приём заявок</span></div>
        <div><b>1 файл</b><span>для смены бренда</span></div>
      </section>

      <section className="services-section" id="services">
        <div className="section-intro">
          <div><span className="kicker">КОНСТРУКТОР ПРОЕКТА</span><h2>Выберите основу<br />и нужные модули</h2></div>
          <p>Добавьте решения в расчёт. Итоговую стоимость и сроки подтвердим после короткого созвона.</p>
        </div>

        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти пакет или функцию…" />
          {query && <button onClick={() => setQuery("")} aria-label="Очистить поиск">×</button>}
        </label>

        <div className="category-row" aria-label="Категории решений">
          {studioConfig.categories.map((item) => (
            <button key={item.id} className={category === item.id ? "active" : ""} onClick={() => setCategory(item.id)} aria-pressed={category === item.id}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>

        {filtered.length ? (
          <div className="service-grid">
            {filtered.map((service) => (
              <article className="service-card" key={service.id}>
                <div className={`service-visual accent-${service.accent}`}>
                  {service.badge && <span className="service-badge">{service.badge}</span>}
                  <b>{service.symbol}</b><i>↗</i>
                </div>
                <div className="service-info">
                  <p>{service.short}</p><h3>{service.name}</h3>
                  <div><strong>от {money.format(service.price)} <small>{studioConfig.currency}</small></strong><button onClick={() => addToCart(service)} aria-label={`Добавить ${service.name} в расчёт`}>+</button></div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-search"><span>⌕</span><h3>Ничего не найдено</h3><p>Сбросьте поиск или оставьте запрос — нестандартные функции тоже делаем.</p><button onClick={() => { setQuery(""); setCategory("all"); }}>Показать всё</button></div>
        )}
      </section>

      <section className="showcase-section" id="showcase">
        <div className="showcase-copy"><span className="kicker kicker-dark">ОДНА ОСНОВА — ЛЮБАЯ НИША</span><h2>Не шаблон.<br />Система продаж.</h2><p>Сайт выглядит как ваш бренд, а внутри уже готовы ключевые сценарии интернет-магазина.</p></div>
        <div className="industry-cloud" aria-label="Подходящие сферы">
          {studioConfig.industries.map((industry, index) => <span key={industry} className={`chip-${(index % 4) + 1}`}>{industry}</span>)}
        </div>
        <div className="feature-grid">
          <article><span>01</span><h3>Каталог и поиск</h3><p>Категории, фильтры и карточки под ваш ассортимент.</p></article>
          <article><span>02</span><h3>Корзина и заказ</h3><p>Понятный путь от товара до подтверждённой заявки.</p></article>
          <article><span>03</span><h3>Telegram и CRM</h3><p>Менеджер получает данные клиента без ручного переноса.</p></article>
          <article><span>04</span><h3>Оплата и доставка</h3><p>Подключаем подходящие бизнесу способы получения и оплаты.</p></article>
        </div>
      </section>

      <section className="process-section" id="process">
        <div className="section-intro"><div><span className="kicker">ПРОЦЕСС</span><h2>От идеи<br />до запуска</h2></div><p>Понятные этапы, фиксированный объём и демонстрация результата по ходу работы.</p></div>
        <div className="process-list">
          {studioConfig.process.map((step) => <article key={step.number}><b>{step.number}</b><div><h3>{step.title}</h3><p>{step.text}</p></div><span>↗</span></article>)}
        </div>
      </section>

      <section className="faq-section" id="faq">
        <span className="kicker">БЕЗ МЕЛКОГО ШРИФТА</span><h2>Частые вопросы</h2>
        <div className="faq-list">
          {studioConfig.faq.map((item) => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}
        </div>
      </section>

      <section className="final-cta">
        <span className="kicker kicker-dark">ГОТОВЫ ПОКАЗАТЬ ВАШУ ВЕРСИЮ</span>
        <h2>Ваш бизнес может<br />продавать <i>онлайн.</i></h2>
        <p>Соберите примерный проект — заявка придёт напрямую владельцу студии в Telegram.</p>
        <button className="button-primary light" onClick={() => scrollToId("services")}>Рассчитать проект <span>↗</span></button>
        <div className="footer-line"><b>{studioConfig.brand.name}</b><span>Интернет-магазины • автоматизация • поддержка</span><small>© 2026</small></div>
      </section>

      <nav className="bottom-nav" aria-label="Основная навигация">
        <button onClick={() => scrollToId("home")}><span>⌂</span>Главная</button>
        <button onClick={() => scrollToId("services")}><span>▦</span>Решения</button>
        <button onClick={() => scrollToId("process")}><span>↗</span>Процесс</button>
        <button onClick={() => setCartOpen(true)} className={cartCount ? "has-items" : ""}><span>＋</span>Расчёт{cartCount > 0 && <b>{cartCount}</b>}</button>
      </nav>

      {cartOpen && (
        <div className="modal-layer" role="presentation" onMouseDown={() => setCartOpen(false)}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="drawer-head"><div><span className="kicker">ВАШ ПРОЕКТ</span><h2 id="cart-title">Расчёт</h2></div><button onClick={() => setCartOpen(false)} aria-label="Закрыть расчёт">×</button></div>
            {cartLines.length ? <>
              <div className="cart-lines">{cartLines.map((line) => <article key={line.id}><span className={`mini-symbol accent-${line.accent}`}>{line.symbol}</span><div><h3>{line.name}</h3><span>от {money.format(line.price)} сом</span></div><div className="quantity"><button onClick={() => updateQuantity(line.id, -1)} aria-label="Уменьшить количество">−</button><b>{line.quantity}</b><button onClick={() => updateQuantity(line.id, 1)} aria-label="Увеличить количество">+</button></div></article>)}</div>
              <div className="cart-total"><span>Предварительно</span><strong>от {money.format(subtotal)} сом</strong><small>Точная смета после уточнения задач</small></div>
              <button className="button-primary wide" onClick={openCheckout}>Отправить на расчёт <span>↗</span></button>
            </> : <div className="empty-cart"><span>＋</span><h3>Проект пока пуст</h3><p>Выберите пакет и нужные функции — мы соберём предварительный расчёт.</p><button onClick={() => { setCartOpen(false); scrollToId("services"); }}>Выбрать решения</button></div>}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="modal-layer checkout-layer" role="presentation" onMouseDown={() => !submitting && setCheckoutOpen(false)}>
          <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="drawer-head"><div><span className="kicker">ПОЧТИ ГОТОВО</span><h2 id="checkout-title">Заявка</h2></div><button onClick={() => setCheckoutOpen(false)} aria-label="Закрыть форму">×</button></div>
            {orderId ? <div className="order-success"><span>✓</span><h3>Заявка отправлена!</h3><p>Проект <b>#{orderId}</b> уже в Telegram. Свяжемся с вами, чтобы уточнить задачи.</p><button className="button-primary wide" onClick={() => setCheckoutOpen(false)}>Готово</button></div> :
              <form onSubmit={submitRequest}>
                <label><span>Ваше имя</span><input name="name" required maxLength={80} placeholder="Как к вам обращаться?" autoComplete="name" /></label>
                <label><span>Телефон</span><input name="phone" required maxLength={30} placeholder="+996 ___ __ __ __" inputMode="tel" autoComplete="tel" /></label>
                <label><span>Компания или сфера</span><input name="address" required maxLength={180} placeholder="Например: магазин одежды" /></label>
                <label><span>Формат проекта</span><select name="delivery" defaultValue="Интернет-магазин"><option>Интернет-магазин</option><option>Каталог с заявками</option><option>Корпоративный сайт</option><option>Нужна консультация</option></select></label>
                <label><span>Ориентир по бюджету</span><select name="payment"><option>Нужно рассчитать</option><option>До 30 000 сом</option><option>30 000–60 000 сом</option><option>От 60 000 сом</option></select></label>
                <label><span>Комментарий</span><textarea name="comment" maxLength={500} placeholder="Что продаёте и какие функции нужны?" rows={3} /></label>
                <label className="website-field" aria-hidden="true"><span>Сайт</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
                <div className="checkout-summary"><span>{cartCount} поз.</span><strong>от {money.format(subtotal)} сом</strong></div>
                {error && <p className="form-error">{error}</p>}
                <button className="button-primary wide" disabled={submitting}>{submitting ? "Отправляем…" : "Получить расчёт"}<span>↗</span></button>
                <small>{studioConfig.brand.telegramLabel}. Нажимая кнопку, вы соглашаетесь на обработку данных.</small>
              </form>}
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </main>
  );
}
